const Jwt = require('./jwt');
const AppError = require('../appError');
const {
  TOKEN_ISSUER,
  TOKEN_AUDIENCE,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} = require('../../config/appConfig');

/**
 * @description Utility class for authentication
 * @class AuthUtils
 * @extends {Jwt}
 */
class AuthUtils extends Jwt {
  /**
   * Generates Access and Refresh Tokens
   * @param {object} user
   * @param {string} accessTokenKey
   * @param {string} refreshTokenKey
   * @returns {Promise<{accessToken:string, refreshToken:string}>} tokens
   */
  async createTokens(user, accessTokenKey, refreshTokenKey) {
    try {
      const accessToken = await this.generateToken(
        {
          issuer: TOKEN_ISSUER,
          audience: TOKEN_AUDIENCE,
          userId: user._id,
          accessTokenKey,
        },
        ACCESS_TOKEN_EXPIRES_IN
      );
      const refreshToken = await this.generateToken(
        {
          issuer: TOKEN_ISSUER,
          audience: TOKEN_AUDIENCE,
          userId: user._id,
          refreshTokenKey,
        },
        REFRESH_TOKEN_EXPIRES_IN
      );

      return { accessToken, refreshToken };
    } catch {
      throw new AppError(500, 'fail', 'Internal Server Error');
    }
  }
  getAccessToken(authorization) {
    if (!authorization)
      throw new AppError(401, 'fail', 'Unauthorized, Please login again');
    const token = authorization.split(' ')[1];
    if (!token)
      throw new AppError(401, 'fail', 'Unauthorized, Please login again');
    return token;
  }
}

module.exports = AuthUtils;
