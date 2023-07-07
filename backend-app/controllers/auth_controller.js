const { promisify } = require('util');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user_model');
const AppError = require('../utils/app_error');
const Role = require('../utils/authorization/role/role');
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REQUIRE_ACTIVATION,
} = require('../config/app_config');
const {
  getGithubOAuthUser,
  getGithubOAuthToken,
  getGithubOAuthUserPrimaryEmail,
} = require('../utils/authorization/github');
const role = new Role();

const createToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
};
const generateActivationKey = async () => {
  const randomBytesPromiseified = promisify(require('crypto').randomBytes);
  const activationKey = (await randomBytesPromiseified(32)).toString('hex');
  return activationKey;
};

exports.githubHandler = async (req, res, next) => {
  try {
    const Roles = await role.getRoles();
    const { code } = req.query;
    if (!code) throw new AppError(400, 'fail', 'Please provide code');
    const { access_token } = await getGithubOAuthToken(code);
    if (!access_token) throw new AppError(400, 'fail', 'Invalid code');
    const githubUser = await getGithubOAuthUser(access_token);
    const primaryEmail = await getGithubOAuthUserPrimaryEmail(access_token);
    const exists = await User.findOne({ email: primaryEmail });
    if (exists)
      return res.status(200).json({
        token: createToken(exists.id),
      });
    if (!githubUser) throw new AppError(400, 'fail', 'Invalid access token');
    const createdUser = await User.create({
      name: githubUser.name,
      email: primaryEmail,
      password: null,
      address: githubUser.location,
      roles: [Roles.USER.type],
      authorities: Roles.USER.authorities,
      restrictions: Roles.USER.restrictions,
      githubOauthAccessToken: access_token,
      active: true,
    });
    const token = createToken(createdUser.id);
    res.status(201).json({
      user: createdUser,
      token,
    });
  } catch (err) {
    next(err);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) check if email and password existos
    if (!email || !password) {
      return next(
        new AppError(404, 'fail', 'Please provide email or password')
      );
    }

    // 2) check if user exist and password is correct
    const user = await User.findOne({
      email,
    }).select('+password');
    // Check if the account is banned
    if (user && user?.accessRestricted)
      throw new AppError(
        403,
        'fail',
        'Your account has been banned. Please contact the admin for more information.'
      );

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError(401, 'fail', 'Email or Password is wrong'));
    }

    // 3) All correct, send jwt to client
    const token = createToken(user.id);

    // Remove the password from the output
    user.password = undefined;

    res.status(200).json({
      token,
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
    const activationKey = await generateActivationKey();
    const Roles = await role.getRoles();
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      roles: [Roles.USER.type],
      authorities: Roles.USER.authorities,
      restrictions: Roles.USER.restrictions,
      ...(REQUIRE_ACTIVATION && { activationKey }),
    });
    const token = createToken(user.id);

    // Remove the password and activation key from the output
    user.password = undefined;
    user.activationKey = undefined;

    Logger.info(
      `User ${user._id} with email ${user.email} has been created with activation key ${activationKey}`
    );

    res.status(201).json({
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.activateAccount = async (req, res, next) => {
  try {
    const { id, activationKey } = req.query;

    if (!activationKey) {
      return next(new AppError(400, 'fail', 'Please provide activation key'));
    }
    if (!id) {
      return next(new AppError(400, 'fail', 'Please provide user id'));
    }

    // check if a valid id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(400, 'fail', 'Please provide a valid user id'));
    }

    const user = await User.findOne({
      _id: id,
    }).select('+activationKey');

    if (!user) {
      return next(new AppError(404, 'fail', 'User does not exist'));
    }
    if (user.active) {
      return next(new AppError(409, 'fail', 'User is already active'));
    }

    // verify activation key
    if (activationKey !== user.activationKey) {
      return next(new AppError(400, 'fail', 'Invalid activation key'));
    }
    // activate user
    user.active = true;
    user.activationKey = undefined;
    await user.save();
    // Remove the password from the output
    user.password = undefined;

    res.status(200).json({
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { email, resetKey, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!resetKey) {
      return next(new AppError(400, 'fail', 'Please provide reset key'));
    }

    if (resetKey !== user.resetKey) {
      return next(new AppError(400, 'fail', 'Invalid reset key'));
    }

    user.password = password;
    user.resetKey = undefined;
    await user.save();

    const token = createToken(user.id);
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError(400, 'fail', 'Please provide email'));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(
        new AppError(404, 'fail', 'User with this email does not exist')
      );
    }

    const resetKey = user.generateResetKey();
    await user.save();

    Logger.info(
      `User ${user.name} with email ${user.email} has requested for password reset with reset key ${resetKey}`
    );

    // send email with reset key
    // TODO: send email with reset key

    res.status(200).json({
      status: 'success',
    });
  } catch (err) {
    next(err);
  }
};

exports.protect = async (req, res, next) => {
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
    const decode = await promisify(jwt.verify)(token, JWT_SECRET);

    // 3) check if the user is exist (not deleted)
    const user = await User.findById(decode.id).select(
      '+githubOauthAccessToken'
    );
    if (!user) {
      return next(new AppError(401, 'fail', 'This user is no longer exist'));
    }

    // Check if the account is banned
    if (user?.accessRestricted)
      return next(
        new AppError(
          403,
          'fail',
          'Your account has been banned. Please contact the admin for more information.'
        )
      );
    req.user = user;
    // check if account is active
    if (!user.active)
      return next(
        new AppError(
          403,
          'fail',
          'Your account is not active. Please activate your account to continue.'
        )
      );

    next();
  } catch (err) {
    // check if the token is expired
    if (err.name === 'TokenExpiredError') {
      return next(new AppError(401, 'fail', 'Your token is expired'));
    }
    next(err);
  }
};

// Authorization check if the user have rights to do this action
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    const roleExist = roles.some((role) => {
      return req.user.roles.includes(role);
    });
    if (!roleExist) {
      return next(
        new AppError(403, 'fail', 'You are not allowed to do this action')
      );
    }
    next();
  };
};
