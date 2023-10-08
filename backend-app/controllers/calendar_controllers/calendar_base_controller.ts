import { IReq, IRes, INext } from '@interfaces/vendors';
import AppError from '@utils/app_error';
import * as calendar_validators from './calendar_validators';

export const updateCalendar = async (
    req: IReq,
    _res: IRes,
    next: INext
): Promise<void> => {
    try {
        const calendar = await calendar_validators.validateCalendar(req);
        // check if user is not admin nor the owner of the calendar
        if (
            calendar.createdBy !== req.user._id.toString() ||
            !req.user.roles.includes('ADMIN') ||
            !req.user.roles.includes('SUPER_ADMIN')
        ) {
            throw new AppError(
                403,
                'You are not allowed to update this calendar'
            );
        }
        // TODO: update calendar
    } catch (err) {
        next(err);
    }
};

export const deleteCalendar = async (
    req: IReq,
    _res: IRes,
    next: INext
): Promise<void> => {
    try {
        const calendar = await calendar_validators.validateCalendar(req);
        // check if user is not admin nor the owner of the calendar
        if (
            calendar.createdBy !== req.user._id.toString() ||
            !req.user.roles.includes('SUPER_ADMIN')
        ) {
            throw new AppError(
                403,
                'You are not allowed to delete this calendar'
            );
        }
        // TODO: delete calendar
    } catch (err) {
        next(err);
    }
};
