import User from '@models/user/user_model';
import * as base from '../base_controller';
import AppError from '@utils/app_error';
import { INext, IReq, IRes } from '@interfaces/vendors';

export const getMe = (req: IReq, res: IRes) => {
    // return data of the current user
    res.status(200).json({
        user: req.user,
    });
};

export const deleteMe = async (req: IReq, res: IRes, next: INext) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            deleted: true,
            deletedAt: Date.now(),
            deletedBy: req.user._id,
        });

        res.status(204).json({
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

export const updateMe = async (req: IReq, res: IRes, next: INext) => {
    try {
        // 1) Create error if user POSTs password data
        if (req.body.password || req.body.passwordConfirm) {
            throw new AppError(
                400,
                'This route is not for password updates. Please use /updateMyPassword'
            );
        }
        // create error if user tries to update role
        if (req.body.roles) {
            throw new AppError(
                400,
                'This route is not for role updates. Please use /updateRole'
            );
        }
        // 2) Filtered out unwanted fields names that are not allowed to be updated
        const payload = {
            name: req.body.name,
            email: req.body.email,
        };
        // 3) Update user document
        const doc = await User.findByIdAndUpdate(req.user._id, payload, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            return next(new AppError(404, 'No document found with that id'));
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
