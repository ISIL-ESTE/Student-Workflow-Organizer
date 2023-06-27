const httpStatus = require('http-status-codes');
const { CURRENT_ENV } = require("../config/app_config");
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
  err.path = err.path || req.path;
  if (err.code === 11000) {
    Object.keys(err.keyValue).forEach((key) => {
      err.message = `Duplicate value for the field : [${key}] Please use another value!`;
    });
    err.statusCode = 409;
  }
  if (err.name === 'ValidationError') {
    err = new AppError(400, 'fail', err.message);
  }
  // If the error dosent have a status code, set it to 500
  err.statusCode = err.statusCode || 500;
  // If the error dosent have a message, set it to 'Internal Server Error'
  err.message = err.message || httpStatus.getStatusText(err.statusCode);
  // descreption
  let message;
  if (err.statusCode >= 500) {
    if (CURRENT_ENV === "development") {
      message = err.message;
    } else {
      message =
        "We're sorry, something went wrong. Please try again later.";
    }
  } else {
    message = err.message;
  }
  res.status(err.statusCode).json({
    status: err.statusCode,
    title: httpStatus.getStatusText(err.statusCode),
    details: {
      ...(err.path && { path: err.path }),
      description: message,
      ...(CURRENT_ENV === "development" && {
        error: " Do not Forget to remove this in production! \n " + err.stack,
      }),
    },
  });
};
