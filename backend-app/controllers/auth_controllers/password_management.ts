import User from '@models/user/user_model';
import logger from '@utils/logger';
import AppError from '@utils/app_error';
import generateTokens from '@utils/authorization/generate_tokens';
import validator from 'validator';
import { Body, Controller, Post, Route, Tags } from 'tsoa';

interface UpdatePasswordRequestBody {
    email: string;
    resetKey: string;
    password: string;
}

interface ForgotPasswordRequestBody {
    email: string;
}

@Route('password-management')
@Tags('Password Management')
export class PasswordManagementController extends Controller {
    @Post('update-password')
    public async updatePassword(
        @Body() requestBody: UpdatePasswordRequestBody
    ) {
        try {
            const { email, resetKey, password } = requestBody;

            if (!validator.isEmail(email))
                throw new AppError(400, 'Invalid email format');

            const user = await User.findOne({ email }).select('+password');

            if (!user)
                throw new AppError(404, 'User with this email does not exist');

            if (!resetKey) throw new AppError(400, 'Please provide reset key');

            if (!user.resetKey) throw new AppError(400, 'Invalid reset key');

            if (resetKey !== user.resetKey)
                throw new AppError(400, 'Invalid reset key');

            user.password = password;
            user.resetKey = undefined;
            await user.save();

            const token = generateTokens(user.id);
            user.password = undefined;

            return {
                token,
                user,
            };
        } catch (err) {
            this.setStatus(err.statusCode || 500);
            return { message: err.message };
        }
    }

    @Post('forgot-password')
    public async forgotPassword(
        @Body() requestBody: ForgotPasswordRequestBody
    ) {
        try {
            const { email } = requestBody;

            if (!email) throw new AppError(400, 'Please provide email');

            if (!validator.isEmail(email))
                throw new AppError(400, 'Invalid email format');

            const user = await User.findOne({ email });

            if (!user)
                throw new AppError(404, 'User with this email does not exist');

            const resetKey = user.generateResetKey();
            await user.save();

            logger.info(
                `User ${user.name} with email ${user.email} has requested for password reset with reset key ${resetKey}`
            );

            // send email with reset key
            // eslint-disable-next-line no-warning-comments
            // TODO: send email with reset key

            return {
                message: 'Email with reset key sent successfully',
            };
        } catch (err) {
            this.setStatus(err.statusCode || 500);
            return { message: err.message };
        }
    }
}
