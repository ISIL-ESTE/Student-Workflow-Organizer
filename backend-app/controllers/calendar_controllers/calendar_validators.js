const calendarModel = require('../../models/calendar/calendar_model');

exports.validateCalendar = async function validateCalendar(req) {
    const calendarid = req.params.calendarid;
    if (!calendarid) {
        throw new AppError('Calendar id is required', 400);
    }
    const calendar = await calendarModel.findById(calendarid);
    if (!calendar) {
        throw new AppError('Calendar not found with that id', 404);
    }
    return calendar;
};
