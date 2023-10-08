/**
 * @description This file contains the morgan middleware for logging requests
 */
import morgan from 'morgan';
import logger from '@utils/logger';
import { CURRENT_ENV } from '@config/app_config';

// Create a stream object with a 'write' function that will be used by `morgan`
const stream = {
    write: (message: string) => logger.http(message),
};

// Setup the logger
const Morgan = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    {
        stream,
        skip: (req: any) =>
            CURRENT_ENV.toLowerCase() === 'production' ||
            CURRENT_ENV.toLowerCase() === 'test' ||
            (req.originalUrl && req.originalUrl !== req.url),
    }
);

// Export the logger
export default Morgan;
