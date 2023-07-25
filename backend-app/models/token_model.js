const mongoose = require('mongoose');
const { REFRESH_TOKEN_EXPIRY_TIME } = require('../config/app_config');

const tokenSchema = new mongoose.Schema(
    {
        accessToken: { type: String, required: true },
        refreshToken: { type: String, required: true },
        userId: { type: String, required: true },
    },
    {
        timestamps: true,
        expires: REFRESH_TOKEN_EXPIRY_TIME,
        versionKey: false,
    }
);
tokenSchema.index({ userId: 1 }, { unique: true });

const tokenModel = mongoose.model('Token', tokenSchema);
module.exports = tokenModel;
