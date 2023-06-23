const User = require('../models/userModel');
const AppError = require('../utils/appError');
const Role = require('../utils/auth/role/Role');
const AuthUtils = require('../utils/auth/auth_utils');
const AuthTokenKeysModel = require('../models/auth_token_keys_model');
const role = new Role();
const authUtils = new AuthUtils();
const crypto = require('crypto');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) check if email and password existos
    if (!email || !password) {
      return next(
        new AppError(404, 'fail', 'Please provide email or password'),
        req,
        res,
        next
      );
    }

    // 2) check if user exist and password is correct
    const user = await User.findOne({
      email,
    }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(
        new AppError(401, 'fail', 'Email or Password is wrong'),
        req,
        res,
        next
      );
    }

    // 3) All correct, send jwt to client
    const oldKeys = await AuthTokenKeysModel.findOne({ userId: user._id });
    if (oldKeys) await oldKeys.remove();
    const accessTokenKey = crypto.randomBytes(32).toString('hex');
    const refreshTokenKey = crypto.randomBytes(32).toString('hex');
    const authTokenKeysRecord = await AuthTokenKeysModel.create({
      userId: user._id,
      accessTokenKey,
      refreshTokenKey,
    });
    if (!authTokenKeysRecord)
      return next(new AppError(500, 'fail', 'Internal Server Error'));
    const tokens = await authUtils.createTokens(
      user,
      accessTokenKey,
      refreshTokenKey
    );

    // Remove the password from the output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      tokens,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const Roles = await role.getRoles();
    const exists = await User.findOne({
      email: req.body.email,
    });
    if (exists)
      return next(
        new AppError(409, 'fail', 'Email already exists'),
        req,
        res,
        next
      );
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      roles: [Roles.USER.type],
      authorities: Roles.USER.authorities,
      restrictions: Roles.USER.restrictions,
    });
    const accessTokenKey = crypto.randomBytes(32).toString('hex');
    const refreshTokenKey = crypto.randomBytes(32).toString('hex');
    const authTokenKeysRecord = await AuthTokenKeysModel.create({
      userId: user._id,
      accessTokenKey,
      refreshTokenKey,
    });
    if (!authTokenKeysRecord)
      return next(new AppError(500, 'fail', 'Internal Server Error'));
    const tokens = await authUtils.createTokens(
      user,
      accessTokenKey,
      refreshTokenKey
    );
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      tokens,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const userAuthTokenKeys = req.authTokenKeys;
    if (!userAuthTokenKeys)
      return next(new AppError(500, 'fail', 'Internal Server Error'));
    await AuthTokenKeysModel.deleteOne({ userId: userAuthTokenKeys.userId });
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

exports.tokenRefresh = async (req, res, next) => {
  const { authorization } = req.headers;
  try {
    const AccessToken = await authUtils.getAccessToken(authorization);
    const RefreshToken = req.body.refreshToken; //decoding access token
    // decoding access token
    const accessTokenPayload = await authUtils.decodeToken(AccessToken);
    if (!accessTokenPayload?.userId && !accessTokenPayload?.accessTokenKey)
      throw new AppError(401, 'fail', 'Invalid access token');

    // searching the user record
    const getUser = await User.findById(accessTokenPayload.userId);
    if (!getUser) throw new AppError(401, 'fail', 'Invalid access token');
    // decoding refresh token
    const refreshTokenPayload = await authUtils.validateToken(RefreshToken);
    if (!refreshTokenPayload?.userId && !refreshTokenPayload?.refreshTokenKey)
      throw new AppError(401, 'fail', 'Invalid refresh token');
    if (refreshTokenPayload.userId !== accessTokenPayload.userId)
      throw new AppError(401, 'fail', 'Invalid refresh token');
    //searching the auth token keys record of the user.
    const authTokenKeysRecord = await AuthTokenKeysModel.findOne({
      userId: getUser._id,
      accessTokenKey: accessTokenPayload.accessTokenKey,
      refreshTokenKey: refreshTokenPayload.refreshTokenKey,
    });
    if (!authTokenKeysRecord)
      throw new AppError(401, 'fail', 'Invalid refresh token');
    //removing the old auth token keys record
    await authTokenKeysRecord.remove();
    //creating new auth token keys record
    const newAuthTokenKeys = await AuthTokenKeysModel.create({
      userId: getUser._id,
      accessTokenKey: crypto.randomBytes(32).toString('hex'),
      refreshTokenKey: crypto.randomBytes(32).toString('hex'),
    });
    //creating access and refresh tokens
    const tokens = await authUtils.createTokens(
      getUser,
      newAuthTokenKeys.accessTokenKey,
      newAuthTokenKeys.refreshTokenKey
    );
    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      tokens,
    });
  } catch (err) {
    next(err);
  }
};
// Authorization check if the user have rights to do this action
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, 'fail', 'You are not allowed to do this action'),
        req,
        res,
        next
      );
    }
    next();
  };
};
