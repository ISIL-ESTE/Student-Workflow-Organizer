import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_PER_HOUR } from '@config/app_config';
import { Request } from 'express';

export default rateLimit({
    max: RATE_LIMIT_PER_HOUR,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
    skip: (req: Request) => req.headers.accept === 'text/event-stream', // Ignore SSE requests
});
