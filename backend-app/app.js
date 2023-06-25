const globalErrHandler = require("./middlewares/globalErrorHandler");
const AppError = require("./utils/appError");
const express = require("express");
const limiter = require("./middlewares/rate_limit");
const compression = require("compression");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const morgan = require("./middlewares/morgan");
const swaggerDocs = require("./utils/swagger");
const { CURRENT_ENV, API_VERSION } = require("./config/appConfig");

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

if (CURRENT_ENV.toLocaleLowerCase() === "production") {
  //Limiting request form same IP
  app.use("/api", limiter);
}

// routes
app.use(`/api/${API_VERSION}`, require("./routes/index"));


app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the backend app",
    env: CURRENT_ENV,
  });
});

// handle undefined Routes
app.use("*", (req, res, next) => {
  const err = new AppError(404, "fail", "Route Not Found", req.path);
  next(err, req, res, next);
});

app.use(globalErrHandler);

module.exports = app;
