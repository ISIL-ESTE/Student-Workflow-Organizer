import User from '@models/user/user_model';
import logger from '@utils/logger';
import AppError from '@utils/app_error';
import generateTokens from '@utils/authorization/generate_tokens';
import validator from 'validator';
import { NextFunction, Request, Response } from 'express';

export const updatePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, resetKey, password } = req.body;

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

        res.status(200).json({
            token,
            user,
        });
    } catch (err) {
        next(err);
    }
};

export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email } = req.body;

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

        res.status(200).json({
            message: 'Email with reset key sent successfully',
        });
    } catch (err) {
        next(err);
    }
};
