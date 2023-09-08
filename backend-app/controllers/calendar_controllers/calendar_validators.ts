import { Request } from 'express';
import AppError from '@utils/app_error';
import Calendar from '@models/calendar/calendar_model';

export async function validateCalendar(req: Request) {
    const calendarid = req.params.calendarid;
    if (!calendarid) {
        throw new AppError('Calendar id is required', 400);
    }
    const calendar = await Calendar.findById(calendarid);
    if (!calendar) {
        throw new AppError('Calendar not found with that id', 404);
    }
    return calendar;
}
