import { Request, Response, NextFunction } from 'express';
import { API_VERSION } from '@config/app_config';

/**
 * Middleware to set default API version in the request URL if not provided.
 * If the API version is missing, it will be set to 'v3' by default.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function to pass control to the next middleware or route handler.
 */
const handleAPIVersion = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.headers['api-version']) {
        req.headers['api-version'] = API_VERSION;
    }
    next();
};

export default handleAPIVersion;
