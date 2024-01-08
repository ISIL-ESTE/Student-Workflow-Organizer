import { IReq } from '@interfaces/vendors';
import AppError from '@utils/app_error';
import validator from 'validator';
import * as calendar_validators from './calendar_validators';
import { ObjectId } from 'mongoose';
import {
    Request,
    Res,
    Body,
    Controller,
    Delete,
    Post,
    Route,
    Security,
    Tags,
    TsoaResponse,
    SuccessResponse,
    Response,
} from 'tsoa';

interface InviteUsersByEmailRequestBody {
    emails: string[];
}

@Security('jwt')
@Route('calendar/participants')
@Tags('Calendar')
export class CalendarParticipantsController extends Controller {
    @Post('invite')
    @Response(400, 'Emails are required')
    @Response(
        403,
        `- You do not have permission to invite users to this calendar
        \n- This calendar is not shareable`
    )
    @SuccessResponse(200, 'OK')
    public async inviteUsersByEmail(
        @Request() req: IReq,
        @Body() body: InviteUsersByEmailRequestBody,
        @Res()
        res: TsoaResponse<
            200,
            { validEmails: string[]; invalidEmails: string[] }
        >
    ) {
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
        const emails = body.emails;
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
        res(200, {
            validEmails,
            invalidEmails,
        });
    }

    @Delete('remove')
    @Response(403, 'You are not the owner of this calendar')
    @SuccessResponse(200, 'OK')
    public async removeCalendarParticipants(
        @Request() req: IReq,
        @Body() body: any,
        @Res() res: TsoaResponse<200, { calendar: any }>
    ) {
        const calendar = await calendar_validators.validateCalendar(req);
        // check if user is the calendar owner
        if (calendar.createdBy.toString() !== req.user._id.toString()) {
            throw new AppError(403, 'You are not the owner of this calendar');
        }
        // get list of participants to remove from calendar
        const listOfParticipants: ObjectId[] = body.participants;
        // remove users from list of participants in calendar
        calendar.participants = calendar.participants.filter(
            (participant: ObjectId) => !listOfParticipants.includes(participant)
        );
        // save calendar
        await calendar.save();
        // return calendar
        res(200, {
            calendar,
        });
    }
}
