import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../../models/user/user_model';
import * as base from '../base_controller';
import AppError from '../../utils/app_error';
import sanitizeRequestBody from '../../utils/sanitize_request_body';

export const getMe = (req: Request, res: Response) => {
    // return data of the current user
    res.status(200).json({
        status: 'success',
        // @ts-ignore
        data: req.user,
    });
};

export const deleteMe = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // @ts-ignore
        await User.findByIdAndUpdate(req.user.id, {
            deleted: true,
            deletedAt: Date.now(),
            // @ts-ignore
            deletedBy: req.user.id,
        });

        res.status(204).json({
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

export const updateMe = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // 1) Create error if user POSTs password data
        if (req.body.password || req.body.passwordConfirm) {
            return next(
                new AppError(
                    400,
                    'fail',
                    'This route is not for password updates. Please use /updateMyPassword'
                )
            );
        }
        // create error if user tries to update role
        if (req.body.roles) {
            return next(
                new AppError(
                    400,
                    'fail',
                    'This route is not for role updates. Please use /updateRole'
                )
            );
        }
        // 2) Filtered out unwanted fields names that are not allowed to be updated
        const filteredfields = Object.keys(req.body).filter(
            (el) => el !== 'email'
        );
        const filteredBody: Partial<IUser> = {};
        filteredfields.forEach((el) => {
            filteredBody[el as keyof IUser] = req.body[el as keyof IUser];
        });

        // validate the request body
        const sanitizedBody = sanitizeRequestBody(User.schema, filteredBody);

        // 3) Update user document
        // @ts-ignore
        const doc = await User.findByIdAndUpdate(req.user.id, sanitizedBody, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            return next(
                new AppError(404, 'fail', 'No document found with that id')
            );
        }

        res.status(200).json({
            doc,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = base.getAll(User);
export const getUser = base.getOne(User);

// Don't update password on this
export const updateUser = base.updateOne(User);
export const deleteUser = base.deleteOne(User);
