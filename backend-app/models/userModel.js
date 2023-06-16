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
    roles: {
      type: Array,
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    accessRestricted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
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
