import { Request } from 'express';
import AppError from '@utils/app_error';
import Calendar from '@models/calendar/calendar_model';

export async function validateCalendar(req: Request) {
    const calendarid = req.params.calendarid;
    if (!calendarid) {
        throw new AppError(400, 'Calendar id is required');
    }
    const calendar = await Calendar.findById(calendarid);
    if (!calendar) {
        throw new AppError(404, 'Calendar not found with that id');
    }
    return calendar;
}
