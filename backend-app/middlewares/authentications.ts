import { IUser } from '@root/interfaces/models/i_user';
import User from '@root/models/user/user_model';
import AppError from '@root/utils/app_error';
import AuthUtils from '@root/utils/authorization/auth_utils';
import * as express from 'express';

export function expressAuthentication(
    req: express.Request,
    securityName: string,
    scopes?: string[]
): Promise<any> {
    return new Promise((resolve, reject) => {
        switch (securityName) {
            case 'jwt':
                validateAccessToken(req)
                    .then((user) => {
                        req.user = user;
                        if (!scopes || scopes.length === 0)
                            return resolve(user);
                        // validate the role
                        const roleExist = scopes.some((role) =>
                            req.user.roles.includes(role)
                        );
                        if (!roleExist)
                            reject(
                                new AppError(
                                    403,
                                    'You are not allowed to do this action'
                                )
                            );
                        return resolve(user);
                    })
                    .catch((err) => {
                        // check if the token is expired
                        if (err.name === 'TokenExpiredError') {
                            return reject(
                                new AppError(401, 'Your token is expired')
                            );
                        }
                        if (err.name === 'JsonWebTokenError') {
                            return reject(new AppError(401, err.message));
                        }
                        return reject(err);
                    });
                break;
            default:
                return reject(
                    new AppError(
                        401,
                        'Unknown security type, Please contact the admin'
                    )
                );
        }
    });
}

async function validateAccessToken(req: express.Request): Promise<IUser> {
    // bearer token cookie and header
    const accessToken =
        req.header('access_token') ||
        req.cookies?.access_token ||
        req.header('authorization')?.replace('Bearer ', '');
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
