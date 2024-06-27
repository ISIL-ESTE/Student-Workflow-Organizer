import { Request, Response, NextFunction } from 'express';
import { API_VERSION } from '@config/app_config';
import AppError from '@root/utils/app_error';

/**
 * Middleware to set default API version in the request URL if not provided.
 * If the API version is missing, it will be set to 'v3' by default.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next function to pass control to the next middleware or route handler.
 */
const handleAPIVersion = (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers['api-version']) {
        req.headers['api-version'] = API_VERSION;
        res.setHeader('api-version', API_VERSION);
    }

    // Redirect to the default API version if the API version is missing in the URL
    if (
        req.url.includes('/docs') ||
        req.url.includes('/docs-json') ||
        req.url.includes(`/${req.headers['api-version']}`)
    )
        return next();

    // validate the API version
    if (!/^v[0-9]+$/.test(String(req.headers['api-version'])) || req.headers['api-version'] > API_VERSION) {
        throw new AppError(400, 'Invalid API version');
    }

    // Check if the API version is the latest
    if (req.headers['api-version'] === API_VERSION) {
        return next();
    }

    return res.redirect(307, `${req.url}/${req.headers['api-version']}`);
};

export default handleAPIVersion;
