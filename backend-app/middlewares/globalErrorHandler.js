const httpStatus = require('http-status-codes');
const currentEnv = process.env.NODE_ENV || 'development';
const AppError = require('../utils/appError');

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
  Logger.error(err.stack);
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.statusCode,
      title: httpStatus.getStatusText(err.statusCode),
      details: {
        ...(err.path && { path: err.path }),
        description: err.message,
      },
      ...(currentEnv === 'development' && {
        error:
          ' Do not Forget to remove this in production!            ' +
          err.stack,
      }),
    });
  } else if (err.code === 11000) {
    Object.keys(err.keyValue).forEach((key) => {
      err.message = `Duplicate value for the field : [${key}] Please use another value!`;
    });
    err.statusCode = 409;
    return res.status(err.statusCode).json({
      status: err.statusCode,
      title: httpStatus.getStatusText(err.statusCode),
      details: {
        ...(err.path && { path: err.path }),
        description: err.message,
      },
    });
  } else {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'something went wrong!';
    return res.status(err.statusCode).json({
      status: err.statusCode,
      title: httpStatus.getStatusText(err.statusCode),
      details: {
        ...(err.path && { path: err.path }),
        description: err.message,
      },
      ...(currentEnv === 'development' && {
        error:
          ' Do not Forget to remove this in production!            ' +
          err.stack,
      }),
    });
  }
};
