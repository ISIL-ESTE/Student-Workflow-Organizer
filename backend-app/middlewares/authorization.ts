import AppError from '@utils/app_error';
import { INext, IReq, IRes } from '@interfaces/vendors';
import User from '@models/user/user_model';

const restrictTo =
    (...actions: string[]) =>
    async (req: IReq, res: IRes, next: INext): Promise<void> => {
        try {
            // get the user by id
            const user = await User.findById(req.user._id);
            if (!user)
                throw new AppError(
                    401,
                    'The user belonging to this token does no longer exist'
                );
            if (user.isAuthorizedTo(actions)) {
                if (!user.isRestrictedFrom(actions)) {
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
                        'You do not have permission to perform this action ; required permissions: ' +
                            actions
                    )
                );
            }
        } catch (error) {
            next(error);
        }
    };
export default restrictTo;
