import * as express from 'express';
import User from '@models/user/user_model';
import AppError from '@root/utils/app_error';

export function inspectAuthority(
    req: express.Request,
    actions: string[]
): Promise<void> {
    return User.findById(req.user._id)
        .then((user) => {
            if (!user)
                throw new AppError(
                    401,
                    'The user belonging to this token does no longer exist'
                );
            if (user.isAuthorizedTo(actions)) {
                if (!user.isRestrictedFrom(actions)) {
                    return Promise.resolve();
                }
                return Promise.reject(
                    new AppError(
                        403,
                        'You are restricted from performing this action, contact the admin for more information'
                    )
                );
            }
            return Promise.reject(
                new AppError(
                    403,
                    'You do not have permission to perform this action ; required permissions: ' +
                        actions
                )
            );
        })
        .catch((error) => Promise.reject(error));
}
