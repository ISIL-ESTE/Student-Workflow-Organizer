const { Model, Schema } = require('mongoose');
const { REFRESH_TOKEN_EXPIRY_TIME } = require('../config/app_config');

const tokenSchema = new Schema(
    {
        accessToken: { type: String, required: true },
        refreshToken: { type: String, required: true },
        userId: { type: String, required: true },
    },
    {
        timestamps: true,
        expires: REFRESH_TOKEN_EXPIRY_TIME,
    }
);
tokenSchema.index({ userId: 1 }, { unique: true });

const tokenModel = new Model('Token', tokenSchema);
module.exports = tokenModel;
