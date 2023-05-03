/**
 * @description - This file contains the configuration for the logger
 */
const { addColors, format, transports, createLogger } = require('winston');
const { join } = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');
const logFilePath = join(__dirname, '../server-logs');

// Define the current environment
const currentEnv = process.env.NODE_ENV || 'development';

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  http: 'magenta',
  debug: 'green',
};
addColors(colors);

/**
 * @description - This is the format for the log message
 * @param {string} info - The log message
 */
const formatLogMessage = format.printf(
  (info) => `[${info.timestamp} - ${info.level} ] ${info.message}`
);

/**
 * if the current environment is development, then log level is debug
 * else log level is warn.
 * when the log level is debug, debug and all the levels above it will be logged.
 * when the log level is warn, warn and all the levels above it will be logged.
 */
const logLevel = currentEnv.toLowerCase() === 'development' ? 'debug' : 'warn';

/**
 * @description - This is the configuration for the logger
 * @param {string} level - The level of the log
 * @param {string} format - The format of the log
 * @param {string} timestamp - The timestamp of the log
 * @param {string} formatLogMessage - The format of the log message
 */
const consoleOptions = {
  level: logLevel,
  format: format.combine(
    format.timestamp({
      format: 'MMM-DD-YYYY HH:mm:ss',
    }),
    format.colorize({ all: true }),
    format.timestamp(),
    formatLogMessage
  ),
};

const fileOptions = {
  logLevel,
  dirname: logFilePath,
  filename: '%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  handleExceptions: true,
  json: true,
  maxSize: '20m',
  maxFiles: '15d',
};

// Define the transport for the logger
const consoleTransport = new transports.Console(consoleOptions);
const fileTransport = new DailyRotateFile(fileOptions);

const Logger = createLogger({
  transports: [consoleTransport, fileTransport], // add the transport to the logger
  exceptionHandlers: [fileTransport],
  exitOnError: false, // do not exit on handled exceptions
});

// Export the logger
module.exports = Logger;
