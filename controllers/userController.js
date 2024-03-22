const fs = require('fs');
const User = require('../models/userModel');

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getAllUsers = (req, res) => {
  res.status(200).json({
    message: 'Hello server',
    results: users.length,
    requestedAt: req.requestTime,
    data: users
  });
};

exports.getUser = (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(item => item.id == id);

  if (user) {
    res.status(200).json({ message: 'Success', data: user });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

exports.patchUser = (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(item => item.id === id);

  if (user) {
    res.status(200).json({ message: 'User patched', data: user });
  } else {
    res.status(404).json({ message: 'user not found' });
  }
};

exports.createUser = (req, res) => {
  const newId = users[users.length - 1].id + 1;
  const newUser = Object.assign({ id: newId }, req.body);

  users.push(newUser);
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    err => {
      res.status(201).json({
        message: 'New user created',
        data: newUser
      });
    }
  );
};

exports.updateMe = async (req, res) => {
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(201).json({
    message: 'User updated',
    user: updatedUser
  });
};
