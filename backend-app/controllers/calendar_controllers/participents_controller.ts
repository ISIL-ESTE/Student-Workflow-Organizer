import { INext, IReq, IRes } from '@interfaces/vendors';
import AppError from '@utils/app_error';
import validator from 'validator';
import * as calendar_validators from './calendar_validators';
import { ObjectId } from 'mongoose';

export const inviteUsersByEmail = async (req: IReq, res: IRes, next: INext) => {
    try {
        // check if calendar exists
        const calendar = await calendar_validators.validateCalendar(req);
        // check if user is the calendar owner
        if (calendar.createdBy.toString() !== req.user._id.toString()) {
            // check if user is a participant and the calendar is shareable
            if (!calendar.participants.includes(req.user._id))
                throw new AppError(
                    403,
                    'You do not have permission to invite users to this calendar'
                );
            if (!calendar.isShareAble)
                throw new AppError(403, 'This calendar is not shareable');
        }
        // get emails from request body
        const emails = req.body.emails;
        if (!emails) {
            throw new AppError(400, 'Emails are required');
        }
        // check if emails are valid
        const validEmails: string[] = [];
        const invalidEmails: string[] = [];
        emails.forEach((email: string) => {
            if (validator.isEmail(email)) {
                validEmails.push(email);
            } else {
                invalidEmails.push(email);
            }
        });
        // TODO: send emails to valid emails
        res.status(200).json({
            validEmails,
            invalidEmails,
        });
    } catch (err) {
        next(err);
    }
};

export const removeCalendarParticipants = async (
    req: IReq,
    res: IRes,
    next: INext
) => {
    try {
        const calendar = await calendar_validators.validateCalendar(req);
        // check if user is the calendar owner
        if (calendar.createdBy.toString() !== req.user._id.toString()) {
            throw new AppError(403, 'You are not the owner of this calendar');
        }
        // get list of participants to remove from calendar
        const listOfParticipants: ObjectId[] = req.body.participants;
        // remove users from list of participants in calendar
        calendar.participants = calendar.participants.filter(
            (participant: ObjectId) => !listOfParticipants.includes(participant)
        );
        // save calendar
        await calendar.save();
        res.status(200).json({
            calendar,
        });
    } catch (err) {
        next(err);
    }
};
