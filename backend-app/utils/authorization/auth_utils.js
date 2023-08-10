const {
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY_TIME,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY_TIME,
    ACCESS_TOKEN_COOKIE_EXPIRY_TIME,
    REFRESH_TOKEN_COOKIE_EXPIRY_TIME,
} = require('../../config/app_config');
const AppError = require('../app_error');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

class AuthUtils {
    static generateAccessToken(id) {
        return jwt.sign({ id }, ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
        });
    }
    static generateRefreshToken(id) {
        return jwt.sign({ id }, REFRESH_TOKEN_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRY_TIME,
        });
    }
    static async verifyAccessToken(token) {
        try {
            return await promisify(jwt.verify)(token, ACCESS_TOKEN_SECRET);
        } catch (error) {
            throw new AppError(401, 'fail', 'Invalid token');
        }
    }
    static async verifyRefreshToken(token) {
        try {
            return await promisify(jwt.verify)(token, REFRESH_TOKEN_SECRET);
        } catch (error) {
            throw new AppError(401, 'fail', 'Invalid token');
        }
    }
    static setAccessTokenCookie(res, accessToken) {
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: ACCESS_TOKEN_COOKIE_EXPIRY_TIME,
        });
        return this;
    }
    static setRefreshTokenCookie(res, refreshToken) {
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_COOKIE_EXPIRY_TIME,
        });
        return this;
    }
}
module.exports = AuthUtils;
