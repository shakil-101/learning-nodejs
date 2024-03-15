const mongoose = require('mongoose');
const validator = require('validator');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm password'],
    validate: {
      // this validator only works on Create or Save password
      validator: function(el) {
        return el === this.password;
      },
      message: 'Password are not the same'
    }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// to compare two passwords, we need to use instance of schema methods
// this instance method will be available to all the user documents
userSchema.methods.correctPassword = async function(
  inputPassword,
  savedPassword
) {
  return await bcrypt.compare(inputPassword, savedPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
