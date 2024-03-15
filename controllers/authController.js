const User = require('../models/userModel');
var jwt = require('jsonwebtoken');

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JwT_EXPIRE_IN
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
