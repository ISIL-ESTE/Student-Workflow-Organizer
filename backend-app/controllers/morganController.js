/**
 * @description This file contains the morgan middleware for logging requests
 */
const morgan = require('morgan');
const Logger = require('../utils/logger');

// Create a stream object with a 'write' function that will be used by `morgan`
const stream = {
  write: (message) => Logger.http(message),
};

// Setup the logger
const morgan = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);

// Export the logger
module.exports = morgan;
