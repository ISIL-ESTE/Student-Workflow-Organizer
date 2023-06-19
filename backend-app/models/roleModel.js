const mongoose = require('mongoose');
const { Actions } = require('../middlewares/authorization');
const validator = require('validator');
const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      uppercase: true,
      validate: {
        validator: (value) => {
          return value.length > 0;
        },
      },
    },
    authorities: [
      {
        type: String,
        required: true,
        default: [],
        validate: {
          validator: (value) => {
            return validator.isIn(value, Object.values(Actions));
          },
        },
      },
    ],
    restrictions: [
      {
        type: String,
        required: true,
        default: [],
        validate: {
          validator: (value) => {
            return validator.isIn(value, Object.values(Actions));
          },
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const roleModel = mongoose.model('Role', roleSchema);
module.exports = roleModel;
