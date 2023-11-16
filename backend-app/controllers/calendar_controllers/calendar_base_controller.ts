import {
    Controller,
    Post,
    Route,
    Tags,
    Request,
    Res,
    Body,
    TsoaResponse,
    Delete,
} from 'tsoa';
import { IReq } from '@interfaces/vendors';
import AppError from '@utils/app_error';
import * as calendar_validators from './calendar_validators';
import { Response, SuccessResponse } from 'tsoa';
@Route('api/calendar')
@Tags('Calendar')
export class CalendarController extends Controller {
    @Post('update')
    @Response(403, 'You are not allowed to update this calendar')
    @SuccessResponse(204, 'No Content')
    public async updateCalendar(
        @Request() req: IReq,
        @Res() _res: TsoaResponse<204, void>,
        @Body() body?: any
    ): Promise<void> {
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
            this.setStatus(err.statusCode || 500);
            throw new Error(err.message);
        }
    }

    @Delete('delete')
    @Response(403, 'You are not allowed to delete this calendar')
    @SuccessResponse(204, 'No Content')
    public async deleteCalendar(
        @Request() req: IReq,
        @Res() _res: TsoaResponse<204, void>,
        @Body() body?: any
    ): Promise<void> {
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
            this.setStatus(err.statusCode || 500);
            throw new Error(err.message);
        }
    }
}
