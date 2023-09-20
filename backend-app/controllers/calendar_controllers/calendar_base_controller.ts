import { Request, Response, NextFunction } from 'express';
import AppError from '@utils/app_error';
import * as calendar_validators from './calendar_validators';

export const updateCalendar = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const calendar = await calendar_validators.validateCalendar(req);
    // check if user is not admin nor the owner of the calendar
    if (
        // @ts-ignore
        calendar.createdBy !== req.user.id.toString() ||
        // @ts-ignore
        !req.user.roles.includes('ADMIN') ||
        // @ts-ignore
        !req.user.roles.includes('SUPER_ADMIN')
    ) {
        return next(
            new AppError(403, 'You are not allowed to update this calendar')
        );
    }
    // TODO: update calendar
};

export const deleteCalendar = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const calendar = await calendar_validators.validateCalendar(req);
    // check if user is not admin nor the owner of the calendar
    if (
        // @ts-ignore
        calendar.createdBy !== req.user.id.toString() ||
        // @ts-ignore
        !req.user.roles.includes('SUPER_ADMIN')
    ) {
        return next(
            new AppError(403, 'You are not allowed to delete this calendar')
        );
    }
    // TODO: delete calendar
};
