import globalErrHandler from './middlewares/global_error_handler';
import AppError from './utils/app_error';
import express, { Request, Response, NextFunction } from 'express';
import limiter from './middlewares/rate_limit';
import bearerToken from 'express-bearer-token';
import compression from 'compression';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import Morgan from './middlewares/morgan';
import swaggerDocs from './utils/swagger/index';
import handleAPIVersion from './middlewares/api_version_controll';
import { COOKIE_SECRET, CURRENT_ENV } from './config/app_config';
import cookieParser from 'cookie-parser';
// import routesVersioning from 'express-routes-versioning';
// import indexRouter from './routes/index';
import { RegisterRoutes } from './routes';

const app = express();

// use json as default format
app.use(express.json());
//configure cookie parser
app.use(cookieParser(COOKIE_SECRET));

// use morgan for logging
app.use(Morgan);

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
app.use(handleAPIVersion);

// handle bearer token
app.use(bearerToken());

app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        message: 'Welcome to the backend app',
        env: CURRENT_ENV,
    });
});

// routes
// app.use(
//     `/api`,
//     routesVersioning()({
//         '1.0.0': indexRouter,
//     })
// );

// register routes
RegisterRoutes(app);

// configure swagger docs
swaggerDocs(app);

// handle undefined Routes
app.use('*', (req: Request, _res: Response, next: NextFunction) => {
    const err = new AppError(404, 'Route Not Found', req.originalUrl);
    next(err);
});

app.use(globalErrHandler);

export default app;
