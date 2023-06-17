const { Schema, Model, Types } = require('mongoose');

const roleSchema = Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    uppercase: true,
  },
  authorities: [
    {
      type: Types.ObjectId,
      ref: 'Action',
      required: true,
    },
  ],
  authorities: [
    {
      type: Types.ObjectId,
      ref: 'Action',
      required: true,
    },
  ],
});

const roleModel = new Model('Role', roleModel);
module.exports = roleModel;
