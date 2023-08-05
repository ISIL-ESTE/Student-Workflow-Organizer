const { API_VERSION } = require('../config/app_config');

/**
 * Middleware to set default API version in the request URL if not provided.
 * If the API version is missing, it will be set to 'v3' by default.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function to pass control to the next middleware or route handler.
 */
const setDefaultAPIVersion = (req, res, next) => {
    // Check if the request URL contains the API version (e.g., /api/v2/some-endpoint)
    const apiVersion = req.url.match(/\/api\/v(\d+)/);
    if (!apiVersion) {
        const url = req.url.replace('/api', '');
        req.url = `/api/${API_VERSION}${url}`;
        res.redirect(req.url)
        return
    }
    else    
        next();
};


module.exports = setDefaultAPIVersion;