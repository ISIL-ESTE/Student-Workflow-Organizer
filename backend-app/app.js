const express = require("express");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const morgan = require("./middlewares/morgan");
const swaggerDocs = require("./utils/swagger");
const { CURRENT_ENV } = require("./config/appConfig");

const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoute");
const globalErrHandler = require("./middlewares/globalErrorHandler");
const AppError = require("./utils/appError");
const app = express();

// configure swagger docs
swaggerDocs(app);

// use json as default format
app.use(express.json());

// use morgan for logging
app.use(morgan);

// Allow Cross-Origin requests
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// Limit request from the same API
const limiter = rateLimit({
  max: 150,
  windowMs: 60 * 60 * 1000,
  message: "Too Many Request from this IP, please try again in an hour",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: "15kb",
  })
);

// Data sanitization against Nosql query injection
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

// Data sanitization against XSS(clean user input from malicious HTML code)
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compress all responses
app.use(compression());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);

// handle undefined Routes
app.use("*", (req, res, next) => {
  const err = new AppError(404, "fail", "Route Not Found", req.path);
  next(err, req, res, next);
});

app.use(globalErrHandler);

module.exports = app;
