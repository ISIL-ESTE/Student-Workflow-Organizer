const User = require('../../models/user/user_model');
const base = require('../base_controller');
const AppError = require('../../utils/app_error');
const sanitizeRequestBody = require('../../utils/sanitize_request_body');

exports.getMe = (req, res) => {
    // return data of the current user
    res.status(200).json({
        status: 'success',
        data: req.user,
    });
};

exports.deleteMe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            deleted: true,
            deletedAt: Date.now(),
            deletedBy: req.user.id,
        });

        res.status(204).json({
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateMe = async (req, res, next) => {
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
        const filteredBody = {};
        filteredfields.forEach((el) => {
            filteredBody[el] = req.body[el];
        });

        // validate the request body
        const sanitizedBody = sanitizeRequestBody(User.schema, filteredBody);

        // 3) Update user document
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

exports.getAllUsers = base.getAll(User);
exports.getUser = base.getOne(User);

// Don't update password on this
exports.updateUser = base.updateOne(User);
exports.deleteUser = base.deleteOne(User);
