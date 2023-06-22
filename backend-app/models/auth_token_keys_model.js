const mongoose = require('mongoose');

const authTokenKeysSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User Id is required'],
    unique: true,
  },
  accessTokenKey: {
    type: String,
    required: [true, 'Access Token Key is required'],
    unique: true,
  },
  refreshTokenKey: {
    type: String,
    required: [true, 'Refresh Token Key is required'],
    unique: true,
  },
});

const AuthTokenKeys = mongoose.model('AuthTokenKeys', authTokenKeysSchema);
module.exports = AuthTokenKeys;
