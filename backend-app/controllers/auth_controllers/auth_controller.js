const { promisify } = require('util');
const mongoose = require('mongoose');
const validator = require('validator');
const User = require('../../models/user/user_model');
const AppError = require('../../utils/app_error');
const Role = require('../../utils/authorization/role/role');
const { REQUIRE_ACTIVATION } = require('../../config/app_config');
const {
    getGithubOAuthUser,
    getGithubOAuthToken,
    getGithubOAuthUserPrimaryEmail,
} = require('../../utils/authorization/github');
const role = new Role();
const AuthUtils = require('../../utils/authorization/auth_utils');
const searchCookies = require('../../utils/searchCookie');

const generateActivationKey = async () => {
    const randomBytesPromiseified = promisify(require('crypto').randomBytes);
    const activationKey = (await randomBytesPromiseified(32)).toString('hex');
    return activationKey;
};

exports.githubHandler = async (req, res, next) => {
    try {
        const Roles = await role.getRoles();
        const { code, redirect_url } = req.query;
        if (!redirect_url)
            throw new AppError(400, 'fail', 'Please provide redirect_url');
        if (!code) throw new AppError(400, 'fail', 'Please provide code');
        const { access_token } = await getGithubOAuthToken(code);
        if (!access_token) throw new AppError(400, 'fail', 'Invalid code');
        const githubUser = await getGithubOAuthUser(access_token);
        const primaryEmail = await getGithubOAuthUserPrimaryEmail(access_token);
        const exists = await User.findOne({ email: primaryEmail });
        if (exists) {
            const accessToken = AuthUtils.generateAccessToken(exists._id);
            const refreshToken = AuthUtils.generateRefreshToken(exists._id);
            AuthUtils.setAccessTokenCookie(
                res,
                accessToken
            ).setRefreshTokenCookie(res, refreshToken);
        }
        if (!githubUser)
            throw new AppError(400, 'fail', 'Invalid access token');
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

        const accessToken = AuthUtils.generateAccessToken(createdUser._id);
        const refreshToken = AuthUtils.generateRefreshToken(createdUser._id);
        AuthUtils.setAccessTokenCookie(res, accessToken).setRefreshTokenCookie(
            res,
            refreshToken
        );
        //redirect user to redirect url
        res.redirect(redirect_url);
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

        if (!validator.isEmail(email)) {
            return next(new AppError(400, 'fail', 'Invalid email format'));
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
            return next(
                new AppError(401, 'fail', 'Email or Password is wrong')
            );
        }

        // 3) All correct, send accessToken & refreshToken to client via cookie
        const accessToken = AuthUtils.generateAccessToken(user._id);
        const refreshToken = AuthUtils.generateRefreshToken(user._id);
        AuthUtils.setAccessTokenCookie(res, accessToken).setRefreshTokenCookie(
            res,
            refreshToken
        );

        // Remove the password from the output
        user.password = undefined;

        res.status(200).json({
            accessToken,
            user,
        });
    } catch (err) {
        next(err);
    }
};

exports.signup = async (req, res, next) => {
    try {
        const activationKey = await generateActivationKey();
        const Roles = await role.getRoles();
        const userpayload = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            roles: [Roles.USER.type],
            authorities: Roles.USER.authorities,
            active: !REQUIRE_ACTIVATION,
            restrictions: Roles.USER.restrictions,
            ...(REQUIRE_ACTIVATION && { activationKey }),
        };
        const user = await User.create(userpayload);
        const accessToken = AuthUtils.generateAccessToken(user._id);
        const refreshToken = AuthUtils.generateRefreshToken(user._id);
        AuthUtils.setAccessTokenCookie(res, accessToken).setRefreshTokenCookie(
            res,
            refreshToken
        );
        // Remove the password and activation key from the output
        user.password = undefined;
        user.activationKey = undefined;

        res.status(201).json({
            accessToken,
            user,
        });
    } catch (err) {
        next(err);
    }
};

exports.tokenRefresh = async (req, res, next) => {
    try {
        const refreshToken = searchCookies(req, 'refresh_token');
        if (!refreshToken)
            throw new AppError(400, 'fail', 'You have to login to continue.');
        const refreshTokenPayload = await AuthUtils.verifyRefreshToken(
            refreshToken
        );
        if (!refreshTokenPayload || !refreshTokenPayload.id)
            throw new AppError(400, 'fail', 'Invalid refresh token');
        const user = await User.findById(refreshTokenPayload.id);
        if (!user) throw new AppError(400, 'fail', 'Invalid refresh token');
        const accessToken = AuthUtils.generateAccessToken(user._id);
        //set or override accessToken cookie.
        AuthUtils.setAccessTokenCookie(res, accessToken);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};
exports.logout = async (req, res, next) => {
    try {
        const accessToken = searchCookies(req, 'access_token');
        if (!accessToken)
            throw new AppError(400, 'fail', 'Please provide access token');
        const accessTokenPayload = await AuthUtils.verifyAccessToken(
            accessToken
        );
        if (!accessTokenPayload || !accessTokenPayload.id)
            throw new AppError(400, 'fail', 'Invalid access token');
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};

exports.activateAccount = async (req, res, next) => {
    try {
        const { id, activationKey } = req.query;

        if (!activationKey) {
            return next(
                new AppError(400, 'fail', 'Please provide activation key')
            );
        }
        if (!id) {
            return next(new AppError(400, 'fail', 'Please provide user id'));
        }

        // check if a valid id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(
                new AppError(400, 'fail', 'Please provide a valid user id')
            );
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
            user,
        });
    } catch (err) {
        next(err);
    }
};

exports.updatePassword = async (req, res, next) => {
    try {
        const { email, resetKey, password } = req.body;

        if (!validator.isEmail(email)) {
            return next(new AppError(400, 'fail', 'Invalid email format'));
        }

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
            user,
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

        if (!validator.isEmail(email)) {
            return next(new AppError(400, 'fail', 'Invalid email format'));
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
        // eslint-disable-next-line no-warning-comments
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
        const accessToken = searchCookies(req, 'access_token') || req.token;
        if (!accessToken)
            return next(new AppError(401, 'fail', 'Please login to continue'));

        const accessTokenPayload = await AuthUtils.verifyAccessToken(
            accessToken
        );
        if (!accessTokenPayload || !accessTokenPayload.id)
            throw new AppError(401, 'fail', 'Invalid access token');
        // 3) check if the user is exist (not deleted)
        const user = await User.findById(accessTokenPayload.id).select(
            'accessRestricted active'
        );
        if (!user) {
            return next(
                new AppError(401, 'fail', 'This user is no longer exist')
            );
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
exports.restrictTo =
    (...roles) =>
    (req, res, next) => {
        const roleExist = roles.some((role) => req.user.roles.includes(role));
        if (!roleExist) {
            return next(
                new AppError(
                    403,
                    'fail',
                    'You are not allowed to do this action'
                )
            );
        }
        next();
    };
