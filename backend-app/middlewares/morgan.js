/**
 * @description This file contains the morgan middleware for logging requests
 */
const morgan = require('morgan');
const { CURRENT_ENV } = require('../config/app_config');

// Create a stream object with a 'write' function that will be used by `morgan`
const stream = {
    write: (message) => Logger.http(message),
};

// Setup the logger
const Morgan = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream, skip: (req, res) => CURRENT_ENV.toLowerCase() === 'production' || (req.originalUrl && req.originalUrl !== req.url) }
);

// Export the logger
module.exports = Morgan;
