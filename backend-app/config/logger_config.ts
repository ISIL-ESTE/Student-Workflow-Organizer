import { addColors, format } from 'winston';
import { logFilePath } from './app_config';
// Define the current environment
import { CURRENT_ENV } from './app_config';

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
    (info) =>
        `[${info.level}] \x1b[1.4m${info.timestamp}\x1b[0m - ${info.message}`
);

/**
 * if the current environment is development, then log level is debug
 * else log level is warn.
 * when the log level is debug, debug and all the levels above it will be logged.
 * when the log level is warn, warn and all the levels above it will be logged.
 */
const logLevel = CURRENT_ENV === 'development' ? 'debug' : 'warn';

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
            format: 'HH:mm:ss MM-DD-YYYY',
        }),
        format.colorize({ all: true }),
        format.timestamp(),
        formatLogMessage
    ),
};

const fileOptions = {
    level: logLevel,
    dirname: logFilePath,
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    handleExceptions: true,
    json: true,
    maxSize: '20m',
    maxFiles: '15d',
};

export { fileOptions, consoleOptions };
