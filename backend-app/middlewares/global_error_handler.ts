import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status-codes';
import { CURRENT_ENV } from '@config/app_config';
import AppError from '@utils/app_error';

/**
 * Error handling middleware
 * @param {Error} err - The error object
 * @param {Object} req - The Express request object
 * @param {Object} res - The Express response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 * Express automatically knows that this entire function is an error handling middleware by specifying 4 parameters
 */
const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Set default values if not provided
    (err as any).path = (err as any).path || req.path;
    (err as any).statusCode = (err as any).statusCode || 500;
    (err as any).message =
        (err as any).message ||
        httpStatus.getStatusText((err as any).statusCode);

    // Handle duplicate key errors
    if ((err as any).code === 11000) {
        Object.keys((err as any).keyValue).forEach((key) => {
            (
                err as any
            ).message = `Duplicate value for the field: [${key}]. Please use another value!`;
        });
        (err as any).statusCode = 409;
    }

    // Handle validation errors
    if ((err as any).name === 'ValidationError') {
        err = new AppError(400, (err as any).message);
    }

    // Determine the description based on error status code and environment
    let description;
    if ((err as any).statusCode >= 500) {
        if (CURRENT_ENV === 'development') {
            description = (err as any).message;
        } else {
            description =
                "We're sorry, something went wrong. Please try again later." +
                err;
        }
    } else {
        description = (err as any).message;
    }

    // Construct the response object
    const response = {
        status: (err as any).statusCode,
        title: httpStatus.getStatusText((err as any).statusCode),
        details: {
            ...((err as any).path && { path: (err as any).path }),
            description,
            ...(CURRENT_ENV === 'development' && {
                error:
                    'Do not forget to remove this in production!\n' +
                    (err as any).stack,
            }),
        },
    };

    // Send the response
    res.status((err as any).statusCode).json(response);
};

export default errorHandler;
