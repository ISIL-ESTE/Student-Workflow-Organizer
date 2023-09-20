import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { promisify } from 'util';
import validator from 'validator';
import AppError from '@utils/app_error';
import Role from '@utils/authorization/role/role';
import { REQUIRE_ACTIVATION } from '@config/app_config';
import {
    getGithubOAuthUser,
    getGithubOAuthToken,
    getGithubOAuthUserPrimaryEmail,
} from '@utils/authorization/github';
import AuthUtils from '@utils/authorization/auth_utils';
import searchCookies from '@utils/searchCookie';
import User from '@models/user/user_model';

const generateActivationKey = async () => {
    const randomBytesPromiseified = promisify(require('crypto').randomBytes);
    const activationKey = (await randomBytesPromiseified(32)).toString('hex');
    return activationKey;
};

export const githubHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const Roles = await Role.getRoles();
        // check if user role exists
        if (!Roles.USER) {
            // send error to client
            return next(
                new AppError(
                    500,
                    'User role does not exist. Please contact the admin.'
                )
            );
        }
        const { code, redirect_url } = req.query;
        if (!redirect_url)
            throw new AppError(400, 'Please provide redirect_url');
        if (typeof redirect_url !== 'string')
            throw new AppError(400, 'Invalid redirect_url');
        if (!code) throw new AppError(400, 'Please provide code');
        const { access_token } = await getGithubOAuthToken(code);
        if (!access_token) throw new AppError(400, 'Invalid code');
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
        if (!githubUser) throw new AppError(400, 'Invalid access token');
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

function validateCredentialsTypes(email: string, password: string) {
    // TODO: impllement joi to validate url params ( only if it's compatible with swagger )
    if (!email || !password) {
        throw new AppError(404, 'Please provide email or password');
    }

    if (!validator.isEmail(email)) {
        throw new AppError(400, 'Invalid email format');
    }

    // to type safty on password
    if (typeof password !== 'string') {
        throw new AppError(400, 'Invalid password format');
    }
}

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.body.nameo)
            throw new AppError(400, 'Please login to continue');

        const { email, password } = req.body;

        // 1) check if email and password existos
        validateCredentialsTypes(email, password);

        // 2) check if user exist and password is correct
        const user = await User.findOne({
            email,
        }).select('+password');

        // check if password exist and  it is a string
        if (!user?.password || typeof user.password !== 'string')
            return next(new AppError(400, 'Invalid email or password'));

        // Check if the account is banned
        if (user && user?.accessRestricted)
            throw new AppError(
                403,
                'Your account has been banned. Please contact the admin for more information.'
            );

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError(401, 'Email or Password is wrong'));
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

export const signup = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const activationKey = await generateActivationKey();
        const Roles = await Role.getRoles();

        // check if user role exists
        if (!Roles.USER)
            throw new AppError(
                500,
                'User role does not exist. Please contact the admin.'
            );

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

export const tokenRefresh = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const refreshToken = searchCookies(req, 'refresh_token');
        if (!refreshToken)
            throw new AppError(400, 'You have to login to continue.');
        const refreshTokenPayload =
            await AuthUtils.verifyRefreshToken(refreshToken);
        if (!refreshTokenPayload || !refreshTokenPayload.id)
            throw new AppError(400, 'Invalid refresh token');
        const user = await User.findById(refreshTokenPayload.id);
        if (!user) throw new AppError(400, 'Invalid refresh token');
        const accessToken = AuthUtils.generateAccessToken(user._id);
        //set or override accessToken cookie.
        AuthUtils.setAccessTokenCookie(res, accessToken);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};
export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const accessToken = searchCookies(req, 'access_token');
        if (!accessToken)
            throw new AppError(400, 'Please provide access token');
        const accessTokenPayload =
            await AuthUtils.verifyAccessToken(accessToken);
        if (!accessTokenPayload || !accessTokenPayload.id)
            throw new AppError(400, 'Invalid access token');
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};

interface ActivationParams {
    id: string;
    activationKey: string;
}

export const activateAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id, activationKey } = req.query as unknown as ActivationParams;

        if (!activationKey) {
            return next(new AppError(400, 'Please provide activation key'));
        }
        if (!id) {
            return next(new AppError(400, 'Please provide user id'));
        }

        // check if a valid id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(400, 'Please provide a valid user id'));
        }

        const user = await User.findOne({
            _id: id,
        }).select('+activationKey');

        if (!user) {
            return next(new AppError(404, 'User does not exist'));
        }
        if (user.active) {
            return next(new AppError(409, 'User is already active'));
        }

        // verify activation key
        if (activationKey !== user.activationKey) {
            return next(new AppError(400, 'Invalid activation key'));
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

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // @ts-ignore
        const accessToken = searchCookies(req, 'access_token') || req.token;
        if (!accessToken)
            return next(new AppError(401, 'Please login to continue'));

        const accessTokenPayload =
            await AuthUtils.verifyAccessToken(accessToken);
        if (!accessTokenPayload || !accessTokenPayload.id)
            throw new AppError(401, 'Invalid access token');
        // 3) check if the user is exist (not deleted)
        const user = await User.findById(accessTokenPayload.id).select(
            'accessRestricted active'
        );
        if (!user) {
            return next(new AppError(401, 'This user is no longer exist'));
        }

        // Check if the account is banned
        if (user?.accessRestricted)
            return next(
                new AppError(
                    403,
                    'Your account has been banned. Please contact the admin for more information.'
                )
            );
        // @ts-ignore
        req.user = user;
        // check if account is active
        if (!user.active)
            return next(
                new AppError(
                    403,
                    'Your account is not active. Please activate your account to continue.'
                )
            );

        next();
    } catch (err) {
        // check if the token is expired
        if (err.name === 'TokenExpiredError') {
            return next(new AppError(401, 'Your token is expired'));
        }
        next(err);
    }
};

// Authorization check if the user have rights to do this action
export const restrictTo =
    (...roles: string[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        // @ts-ignore
        if (!req.user) {
            return next(new AppError(401, 'Please login to continue'));
        }
        // @ts-ignore
        const roleExist = roles.some((role) => req.user.roles.includes(role));
        if (!roleExist) {
            return next(
                new AppError(403, 'You are not allowed to do this action')
            );
        }
        next();
    };
