import AppError from '@utils/app_error';
import { Request, Response, NextFunction } from 'express';

interface User {
    authorities: string[];
    restrictions: string[];
}

/**
 *
 * @param {User} user
 * @param {string[]} actions
 * @returns {boolean}
 */
const hasAuthority = (user: User, actions: string[]): boolean =>
    actions.every((action) => user.authorities.includes(action));

export const restrictTo =
    (...actions: string[]) =>
    (req: Request, res: Response, next: NextFunction): void => {
        // @ts-ignore
        if (hasAuthority(req.user, actions)) {
            // @ts-ignore
            if (!isRestricted(req.user, actions)) {
                next();
            } else {
                next(
                    new AppError(
                        403,
                        'You are restricted from performing this action, contact the admin for more information'
                    )
                );
            }
        } else {
            next(
                new AppError(
                    403,
                    'You do not have permission to perform this action'
                )
            );
        }
    };
