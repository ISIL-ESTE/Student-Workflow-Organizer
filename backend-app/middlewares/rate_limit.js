const rateLimit = require("express-rate-limit");
const { RATE_LIMIT_PER_HOUR } = require("../config/appConfig");

module.exports = rateLimit({
  max: RATE_LIMIT_PER_HOUR,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});