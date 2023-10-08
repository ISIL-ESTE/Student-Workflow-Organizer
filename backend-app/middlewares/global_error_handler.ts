import { NextFunction, Request, Response } from 'express';
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
    _next: NextFunction
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

    // Determine the message based on error status code and environment
    let message;
    if ((err as any).statusCode >= 500) {
        if (CURRENT_ENV === 'development') {
            message = (err as any).message;
        } else {
            message =
                "We're sorry, something went wrong. Please try again later." +
                err;
        }
    } else {
        message = (err as any).message;
    }
    // tsting :
    const stackTrace = (err as any).stack?.split('at ');
    const stackTraceObject = stackTrace?.reduce(
        (acc: any, line: string, index: number) => {
            acc[index + 1] = line;
            return acc;
        },
        {}
    );

    // Construct the response object
    const response = {
        status: (err as any).statusCode,
        title: httpStatus.getStatusText((err as any).statusCode),
        details: {
            ...((err as any).path && { path: (err as any).path }),
            ...(CURRENT_ENV === 'development' && {
                error: {
                    '0': 'Do not forget to remove this in production!',
                    ...stackTraceObject,
                },
            }),
        },
        message,
    };
    // logger.debug((err as any).stack);

    // Send the response
    res.status((err as any).statusCode).json(response);
};

export default errorHandler;
