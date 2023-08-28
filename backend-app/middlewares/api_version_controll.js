const { API_VERSION } = require('../config/app_config');

/**
 * Middleware to set default API version in the request URL if not provided.
 * If the API version is missing, it will be set to 'v3' by default.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function to pass control to the next middleware or route handler.
 */
const handleAPIVersion = (req, res, next) => {
    req.version = req.headers['accept-version'];
    if (!req.version) {
        req.version = API_VERSION;
        req.headers['accept-version'] = API_VERSION;
    }
    next();
};

module.exports = handleAPIVersion;
