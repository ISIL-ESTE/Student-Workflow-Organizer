import { Request, Response } from 'express';
import AppError from '../../utils/app_error';
import validator from 'validator';
import * as calendar_validators from './calendar_validators';
import { ObjectId } from 'mongoose';

export const inviteUsersByEmail = async (req: Request, res: Response) => {
    // check if calendar exists
    const calendar = await calendar_validators.validateCalendar(req);
    // check if user is the calendar owner
    // @ts-ignore
    const userid = req.user._id;
    // @ts-ignore
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
        status: 'success',
        validEmails,
        invalidEmails,
    });
};

export const removeCalendarParticipants = async (
    req: Request,
    res: Response
) => {
    const calendar = await calendar_validators.validateCalendar(req);
    // @ts-ignore
    const userid = req.user._id;
    // check if user is the calendar owner
    // @ts-ignore
    if (calendar.owner.toString() === !userid.toString()) {
        throw new AppError('You are not the owner of this calendar', 403);
    }
    // get list of participants to remove from calendar
    const listOfParticipants: string[] = req.body.participants;
    // remove users from list of participants in calendar
    // @ts-ignore
    calendar.participants = listOfParticipants.filter(
        (participant: string) =>
            !calendar.participants.includes(participant as unknown as ObjectId)
    );
    // save calendar
    await calendar.save();
    res.status(200).json({
        status: 'success',
        calendar,
    });
};
