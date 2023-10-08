/**
 * @description - This file contains the configuration for the logger
 */
import { createLogger, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { fileOptions, consoleOptions } from '@config/logger_config';

// Define the transport for the logger
const consoleTransport = new transports.Console(consoleOptions);
const fileTransport = new DailyRotateFile(fileOptions);

const logger = createLogger({
    transports: [consoleTransport, fileTransport], // add the transport to the logger
    exceptionHandlers: [fileTransport],
    exitOnError: false, // do not exit on handled exceptions
});
// Export the logger
export default logger;
