const httpStatus = require('http-status-codes');
const { CURRENT_ENV } = require('../config/app_config');
const AppError = require('../utils/app_error');
const { Logger } = require('winston');
require('../utils/logger');

/**
 * Error handling middleware
 * @param {Error} err - The error object
 * @param {Object} req - The Express request object
 * @param {Object} res - The Express response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 * Express automatically knows that this entire function is an error handling middleware by specifying 4 parameters
 */
module.exports = (err, req, res, next) => {
    // Set default values if not provided
    err.path = err.path || req.path;
    err.statusCode = err.statusCode || 500;
    err.message = err.message || httpStatus.getStatusText(err.statusCode);

    // Handle duplicate key errors
    if (err.code === 11000) {
        Object.keys(err.keyValue).forEach((key) => {
            err.message = `Duplicate value for the field: [${key}]. Please use another value!`;
        });
        err.statusCode = 409;
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        err = new AppError(400, 'fail', err.message);
    }

    // Determine the description based on error status code and environment
    let description;
    if (err.statusCode >= 500) {
        if (CURRENT_ENV === 'development') {
            description = err.message;
        } else {
            description =
                "We're sorry, something went wrong. Please try again later.";
        }
    } else {
        description = err.message;
    }

    // Construct the response object
    const response = {
        status: err.statusCode,
        title: httpStatus.getStatusText(err.statusCode),
        details: {
            ...(err.path && { path: err.path }),
            description,
            ...(CURRENT_ENV === 'development' && {
                error:
                    'Do not forget to remove this in production!\n' + err.stack,
            }),
        },
    };

    // Send the response
    res.status(err.statusCode).json(response);
};
