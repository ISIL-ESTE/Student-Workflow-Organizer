/**
 * @description - This file contains the configuration for the logger
 */
const { createLogger, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { fileOptions, consoleOptions } = require('../config/loggerConfig');

// Define the transport for the logger
const consoleTransport = new transports.Console(consoleOptions);
const fileTransport = new DailyRotateFile(fileOptions);

const Logger = createLogger({
  transports: [consoleTransport, fileTransport], // add the transport to the logger
  exceptionHandlers: [fileTransport],
  exitOnError: false, // do not exit on handled exceptions
});
// Export the logger
global.Logger = Logger;
