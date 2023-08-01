const {
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY_TIME,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY_TIME,
} = require('../../config/app_config');
const AppError = require('../app_error');
const TokenModel = require('../../models/token_model');
const jwt = require('jsonwebtoken');

const generateTokens = async (id) => {
    try {
        const exists = await TokenModel.findOne({ userId: id });
        if (exists) await TokenModel.findByIdAndDelete(exists._id);
        const accessToken = jwt.sign({ id }, ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
        });
        const refreshToken = jwt.sign({ id }, REFRESH_TOKEN_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRY_TIME,
        });
        if (!accessToken || !refreshToken)
            throw new AppError(
                500,
                'fail',
                'Something went wrong. Please try again later.'
            );
        await TokenModel.create({
            accessToken,
            refreshToken,
            userId: id,
        });
        return { accessToken, refreshToken };
    } catch (err) {
        throw new AppError(
            500,
            'fail',
            'Something went wrong. Please try again later.'
        );
    }
};
module.exports = generateTokens;
