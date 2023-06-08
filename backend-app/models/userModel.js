const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { Actions } = require('../middlewares/authorization');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please fill your name'],
    },
    email: {
      type: String,
      required: [true, 'Please fill your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, ' Please provide a valid email'],
    },
    address: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please fill your password'],
      minLength: 6,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please fill your password confirm'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Your password and confirmation password are not the same',
      },
    },
    authorities: {
      type: Array,
      default: [],
      validate: {
        validator: function (el) {
          return el.every((action) => Object.values(Actions).includes(action));
        },
      },
      message: 'Please provide a valid action',
    },
    restrictions: {
      type: Array,
      default: [],
      validate: {
        validator: function (el) {
          return el.every((action) => Object.values(Actions).includes(action));
        },
        message: 'Please provide a valid action',
      },
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER', 'SUPER_ADMIN'],
      default: 'USER',
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  typedPassword,
  originalPassword
) {
  return await bcrypt.compare(typedPassword, originalPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
