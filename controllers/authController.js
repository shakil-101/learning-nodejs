const { promisify } = require('util');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const User = require('../models/userModel');
var jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JwT_EXPIRE_IN
  });
};

const handleError = (res, code, message) => {
  return res.status(code).json({
    status: 'failed',
    message: message
  });
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: newUser
    });
  } catch (error) {
    res.status(404).json({
      status: 'failed',
      data: error
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  // check if email & password exists

  if (!email || !password) {
    const response = res
      .status(404)
      .json({ message: 'Please provide email and password' });

    return next(response);
  }

  // check if user exists and password is correct

  const user = await User.findOne({ email }).select('+password');
  // the instance that we created in the userModel, is available to all query documents
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    const response = res
      .status(401)
      .json({ message: 'Invalid email or password' });

    return next(response);
  }

  // if everything is okay, send token to client

  const token = signToken(user._id);
  res.status(200).json({ status: 'Success', token });
  next();
};

exports.protect = async (req, res, next) => {
  // 1. getting token and check if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      handleError(res, 401, 'Unauthorized user. Please login to get access')
    );
  }

  // 2. verification token
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3. check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        handleError(
          res,
          401,
          'The user belonging to this token does no longer exist'
        )
      );
    }

    // 4. check if user changed the password after the token was issued

    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        handleError(
          res,
          401,
          'User recently changed the password. Please login again'
        )
      );
    }

    // Grant access to protected router
    req.user = currentUser;
  } catch (error) {
    return next(handleError(res, 401, error));
  }

  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide']
    if (!roles.includes(req.user.role)) {
      const errorMessage = res.status(401).json({
        status: 'Failed',
        message: 'You do not have permission to perform this action'
      });
      return next(errorMessage);
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // 1. get user based on the posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const errorMessage = res
      .status(404)
      .json({ status: 'failed', message: 'User not found' });
    return next(errorMessage);
  }

  // 2. generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send it to users email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const emailMessage = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget the password, please ignore it.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: emailMessage
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const errorMessage = res.status(500).json({
      status: 'failed',
      message: 'There was an error sending the email. Try again'
    });
    return next(errorMessage);
  }
};
exports.resetPassword = async (req, res, next) => {
  if (req.body.password !== req.body.passwordConfirm) {
    const errorMessage = res.status(404).json({
      status: 'failed',
      message: 'password and passwordConfirm are not similar'
    });
    return next(errorMessage);
  }

  // 1. get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2. if the token has not expired and there is user, set new password
  if (!user) {
    const errorMessage = res.status(400).json({
      status: 'failed',
      message: 'token is invalid or has been expired'
    });
    return next(errorMessage);
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. update changedPasswordAt property for the user
  // 4. log the user in and set the token
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });

  next();
};

exports.updatePassword = async (req, res, next) => {
  // 1. get user from collection
  const user = await User.findOne(req.user._id).select('+password');
  console.log(req.body);
  console.log(user);
  // 2. check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(handleError(res, 401, 'Your current password is wrong'));
  }

  // // 3. if so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // // 4. log user in, send JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
};
