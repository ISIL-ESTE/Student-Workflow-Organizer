const rateLimit = require('express-rate-limit');
const { RATE_LIMIT_PER_HOUR } = require('../config/app_config');

module.exports = rateLimit({
    max: RATE_LIMIT_PER_HOUR,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
    skip: (req, res) => req.headers.accept === 'text/event-stream', // Ignore SSE requests
});
