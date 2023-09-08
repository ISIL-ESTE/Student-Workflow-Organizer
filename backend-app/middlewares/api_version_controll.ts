import { Request, Response, NextFunction } from 'express';
import { API_VERSION } from '@config/app_config';

/**
 * Middleware to set default API version in the request URL if not provided.
 * If the API version is missing, it will be set to 'v3' by default.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function to pass control to the next middleware or route handler.
 */
const handleAPIVersion = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    req.version = req.headers['accept-version'];
    // @ts-ignore
    if (!req.version) {
        // @ts-ignore
        req.version = API_VERSION;
        req.headers['accept-version'] = API_VERSION;
    }
    next();
};

export default handleAPIVersion;
