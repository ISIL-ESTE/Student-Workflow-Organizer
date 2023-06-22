const path = require('path');
const { readFile } = require('fs');
const { promisify } = require('util');
const { sign, verify } = require('jsonwebtoken');

const AppError = require('../appError');

/**
 * @description Utility class for jwt
 * @class Jwt
 */
class Jwt {
  /**
   * @description Reads the public key from the file system
   * @returns {Promise<string>} public key
   */
  readPublicKey() {
    return promisify(readFile)(
      path.join(__dirname, '../../keys/jwtRSA256-public.pem'),
      'utf8'
    );
  }
  /**
   * @description Reads the private key from the file system
   * @returns {Promise<string>} private key
   */
  readPrivateKey() {
    return promisify(readFile)(
      path.join(__dirname, '../../keys/jwtRSA256-private.pem'),
      'utf8'
    );
  }
  /**
   * @description Generates a token
   * @param {object} payload
   * @param {string} expiry
   * @returns {Promise<string>} token
   */
  async generateToken(payload, expiry) {
    const cert = await this.readPrivateKey();
    if (!cert) throw new AppError(500, 'fail', 'Internal Server Error');
    return promisify(sign)({ ...payload }, cert, {
      expiresIn: expiry,
      algorithm: 'RS256',
    });
  }
  /**
   * @description Validates the token
   * @param {string} token
   * @returns {Promise<object>} payload
   */
  async validateToken(token) {
    const cert = await this.readPublicKey();
    if (!cert) throw new AppError(500, 'fail', 'Internal Server Error');
    try {
      return await promisify(verify)(token, cert);
    } catch (e) {
      if (e && e.name === 'TokenExpiredError')
        throw new AppError(401, 'fail', 'Token Expired');
      throw new AppError(401, 'fail', 'Invalid Token');
    }
  }
  /**
   * @description Decodes the token even if it is expired
   * @param {string} token
   * @returns {Promise<object>} payload
   */
  async decodeToken(token) {
    const cert = await this.readPublicKey();
    if (!cert) throw new AppError(500, 'fail', 'Internal Server Error');
    try {
      return await promisify(verify)(token, cert, { ignoreExpiration: true });
    } catch (e) {
      throw new AppError(401, 'fail', 'Invalid Token');
    }
  }
}

module.exports = Jwt;
