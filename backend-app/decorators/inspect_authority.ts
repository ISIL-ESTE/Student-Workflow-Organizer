import { Request } from 'express';
import User from '@models/user/user_model';
import AppError from '@root/utils/app_error';

export function InspectAuthority(...actions: string[]): MethodDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const req: Request = args[0];
            const next: Function = args[2];

            User.findById(req.user._id)
                .then((user) => {
                    if (!user)
                        throw new AppError(
                            401,
                            'The user belonging to this token does no longer exist'
                        );
                    if (user.isAuthorizedTo(actions)) {
                        if (!user.isRestrictedFrom(actions)) {
                            originalMethod.apply(this, args);
                        } else {
                            throw new AppError(
                                403,
                                'You are restricted from performing this action, contact the admin for more information'
                            );
                        }
                    } else {
                        throw new AppError(
                            403,
                            'You do not have permission to perform this action ; required permissions: ' +
                                actions
                        );
                    }
                })
                .catch((error) => next(error));
        };
        return descriptor;
    };
}
