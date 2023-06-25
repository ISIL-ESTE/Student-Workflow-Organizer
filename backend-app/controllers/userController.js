const User = require('../models/userModel');
const base = require('./baseController');
const AppError = require("../utils/appError");



exports.getMe = (req, res, next) => {
    // return data of the current user
    req.user.password = undefined;
    res.status(200).json({
        status: 'success',
        data: req.user
    });
};

exports.deleteMe = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            active: false
        });

        res.status(204).json({
            status: 'success',
            data: null
        });


    } catch (error) {
        next(error);
    }
};


exports.updateMe = async (req, res, next) => {
    try {
        // 1) Create error if user POSTs password data
        if (req.body.password || req.body.passwordConfirm) {
            return next(new AppError(403, 'fail', 'This route is not for password updates. Please use /updateMyPassword'), req, res, next);
        }
        // create error if user tries to update role
        if (req.body.roles) {
            return next(new AppError(403, 'fail', 'This route is not for role updates. Please use /updateRole'), req, res, next);
        }
        // 2) Filtered out unwanted fields names that are not allowed to be updated
        const filteredBody = Object.keys(req.body).filter(el => el !== 'email');

        // 3) Update user document
        const doc = await User.findByIdAndUpdate(req.user.id, filteredBody, {
          new: true,
          runValidators: true,
        });
        if (!doc) {
            return next(new AppError(404, "fail", "No document found with that id"), req, res, next);
        }
        doc.password = undefined;

        res.status(200).json({
            status: "success",
            data: {
                doc
            }
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
