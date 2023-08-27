const AppError = require('../../utils/app_error');
const validator = require('validator');
const calendar_validators = require('./calendar_validators');

exports.inviteUsersByEmail = async (req, res) => {
    // check if calendar exists
    const calendar = await calendar_validators.validateCalendar(req);
    // check if user is the calendar owner
    const userid = req.user._id;
    if (calendar.createdBy.toString() !== userid.toString()) {
        // check if user is a participant and the calendar is shareable
        if (!calendar.participants.includes(userid))
            throw new AppError(
                'You do not have permission to invite users to this calendar',
                403
            );
        if (!calendar.isShareAble) {
            throw new AppError('This calendar is not shareable', 403);
        }
    }
    // get emails from request body
    const emails = req.body.emails;
    if (!emails) {
        throw new AppError('Emails are required', 400);
    }
    // check if emails are valid
    const validEmails = [];
    const invalidEmails = [];
    emails.forEach((email) => {
        if (validator.isEmail(email)) {
            validEmails.push(email);
        } else {
            invalidEmails.push(email);
        }
    });
    // TODO: send emails to valid emails
    res.status(200).json({
        status: 'success',
        validEmails,
        invalidEmails,
    });
};

exports.removeCalendarParticipants = async (req, res) => {
    const calendar = await calendar_validators.validateCalendar(req);
    const userid = req.user._id;
    // check if user is the calendar owner
    if (calendar.owner.toString() === !userid.toString()) {
        throw new AppError('You are not the owner of this calendar', 403);
    }
    // get list of participants to remove from calendar
    const listOfParticipants = req.body.participants;
    // remove users from list of participants in calendar
    calendar.participants = listOfParticipants.filter(
        (participant) => !calendar.participants.includes(participant)
    );
    // save calendar
    await calendar.save();
    res.status(200).json({
        status: 'success',
        calendar,
    });
};
