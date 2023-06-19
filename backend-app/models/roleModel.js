const { Schema, Model } = require('mongoose');
const { Actions } = require('../middlewares/authorization');
const validator = require('validator');
const roleSchema = Schema(
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
        validate: {
          validator: (value) => {
            return validator.isIn(value, Object.values(Actions));
          },
        },
      },
    ],
    authorities: [
      {
        type: String,
        required: true,
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

const roleModel = new Model('Role', roleSchema);
module.exports = roleModel;
