const AppError = require('../../utils/app_error');
const calendar_validators = require('./calendar_validators');

exports.updateCalendar = async (req, res, next) => {
    const calendar = await calendar_validators.validateCalendar(req);
    // check if user is not admin nor the owner of the calendar
    if (
        calendar.createdBy !== req.user.id.toString() ||
        !req.user.roles.includes('ADMIN') ||
        !req.user.roles.includes('SUPER_ADMIN')
    ) {
        return next(
            new AppError('You are not allowed to update this calendar', 403)
        );
    }
    // TODO: update calendar
};

exports.deleteCalendar = async (req, res, next) => {
    const calendar = await calendar_validators.validateCalendar(req);
    // check if user is not admin nor the owner of the calendar
    if (
        calendar.createdBy !== req.user.id.toString() ||
        !req.user.roles.includes('SUPER_ADMIN')
    ) {
        return next(
            new AppError('You are not allowed to delete this calendar', 403)
        );
    }
    // TODO: delete calendar
};
