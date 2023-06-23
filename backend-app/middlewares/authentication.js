const User = require('../models/userModel');
const AppError = require('../utils/appError');
const AuthUtils = require('../utils/auth/auth_utils');
const AuthTokenKeysModel = require('../models/auth_token_keys_model');
const authUtils = new AuthUtils();
const deserializeUser = async (req, res, next) => {
  try {
    // 1) check if the token is there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(
        new AppError(
          401,
          'fail',
          'You are not logged in! Please login in to continue'
        )
      );
    }

    // 2) Verify token
    const decode = await authUtils.validateToken(token);
    // 3) check if the user is exist (not deleted)
    const user = await User.findById(decode.userId);
    if (!user)
      return next(new AppError(401, 'fail', 'This user is no longer exist'));

    if (!decode.accessTokenKey)
      return next(new AppError(401, 'fail', 'Invalid token'));
    const keys = await AuthTokenKeysModel.findOne({
      userId: decode.userId,
      accessTokenKey: decode.accessTokenKey,
    });
    if (!keys) return next(new AppError(401, 'fail', 'Invalid token'));
    req.user = user;
    req.authTokenKeys = keys;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  deserializeUser,
};
