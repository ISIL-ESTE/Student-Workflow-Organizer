const globalErrHandler = require('./middlewares/global_error_handler');
const AppError = require('./utils/app_error');
const express = require('express');
const limiter = require('./middlewares/rate_limit');
const compression = require('compression');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const morgan = require('./middlewares/morgan');
const setDefaultAPIVersion = require('./middlewares/api_version_controll');
const swaggerDocs = require('./utils/swagger');
const {
    COOKIE_SECRET,
    CURRENT_ENV,
    API_VERSION,
} = require('./config/app_config');
const cookieParser = require('cookie-parser');

const app = express();

// configure swagger docs
swaggerDocs(app);

// use json as default format
app.use(express.json());
//configure cookie parser
app.use(cookieParser(COOKIE_SECRET));

// use morgan for logging
app.use(morgan);

// Allow Cross-Origin requests
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Limit request from the same API

// Body parser, reading data from body into req.body
app.use(
    express.json({
        limit: '15kb',
    })
);

// Data sanitization against Nosql query injection
app.use(
    mongoSanitize({
        replaceWith: '_',
    })
);

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compress all responses
app.use(compression());

if (CURRENT_ENV === 'production') {
    //Limiting request form same IP
    app.use(limiter);
}

// if no version is specified, use the default version
app.use(setDefaultAPIVersion);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the backend app',
        env: CURRENT_ENV,
    });
});

// routes
app.use(`/api`, require('./routes/index'));

// handle undefined Routes
app.use('*', (req, res, next) => {
    const err = new AppError(404, 'fail', 'Route Not Found', req.originalUrl);
    next(err, req, res, next);
});

app.use(globalErrHandler);

module.exports = app;
