import { IUser } from '@root/interfaces/models/i_user';
import User from '@root/models/user/user_model';
import AppError from '@root/utils/app_error';
import AuthUtils from '@root/utils/authorization/auth_utils';
import logger from '@root/utils/logger';
import searchCookies from '@root/utils/searchCookie';
import * as express from 'express';

export async function expressAuthentication(
    req: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    switch (securityName) {
        case 'jwt':
            try {
                const user = await validateAccessToken(req);
                req.user = user;
                return Promise.resolve(user);
            } catch (err) {
                // check if the token is expired
                if (err.name === 'TokenExpiredError') {
                    return Promise.reject(
                        new AppError(401, 'Your token is expiredo')
                    );
                }
                if (err.name === 'JsonWebTokenError') {
                    return Promise.reject(new AppError(401, err.message));
                }
                return Promise.reject(err);
            }
        default:
            return Promise.reject(
                new AppError(
                    401,
                    'Unknown security type, Please contact the admin'
                )
            );
    }
}

async function validateAccessToken(req: express.Request): Promise<IUser> {
    const accessToken =
        searchCookies(req, 'access_token') || req.header('x-auth-token');
    console.log('token:', accessToken);

    if (!accessToken)
        throw new AppError(
            401,
            'Access Token is required, Please login to continue'
        );

    const accessTokenPayload = await AuthUtils.verifyAccessToken(accessToken);

    if (!accessTokenPayload || !accessTokenPayload._id)
        throw new AppError(401, 'Invalid access token');

    // 3) check if the user is exist (not deleted)
    const user: IUser = await User.findById(accessTokenPayload._id).select(
        'accessRestricted active roles authorities restrictions name email'
    );
    if (!user) {
        throw new AppError(401, 'This user is no longer exist');
    }

    // Check if the account is banned
    if (user?.accessRestricted)
        throw new AppError(
            403,
            'Your account has been banned. Please contact the admin for more information.'
        );

    // check if account is active
    if (!user.active)
        throw new AppError(
            403,
            'Your account is not active. Please activate your account to continue.'
        );

    return user;
}

// Authorization check if the user have rights to do this action
export function RestrictedTo(roles: string[]) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const req = args[0];
            try {
                const roleExist = roles.some((role) =>
                    req.user.roles.includes(role)
                );
                if (!roleExist)
                    throw new AppError(
                        403,
                        'You are not allowed to do this action'
                    );
                return originalMethod.apply(this, args);
            } catch (err) {
                return Promise.reject(err);
            }
        };
        return descriptor;
    };
}
