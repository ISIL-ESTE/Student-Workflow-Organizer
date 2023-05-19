const httpStatus = require("http-status-codes");
const currentEnv = process.env.NODE_ENV || "development";
// Express automatically knows that this entire function is an error handling middleware by specifying 4 parameters
module.exports = (err, req, res, next) => {
  Logger.error(err.stack);
  if (err.code === 11000) {
    Object.keys(err.keyValue).forEach((key) => {
      err.message = `Duplicate value for the field : [${key}] Please use another value!`;
    });
    err.statusCode = 409;
  }
  res.status(err.statusCode).json({
    status: err.statusCode,
    title: httpStatus.getStatusText(err.statusCode),
    details: {
      ...(err.path && { path: err.path }),
      description: err.message,
    },
    ...(currentEnv === "development" && {
      error:
        " Do not Forget to remove this in production!            " + err.stack,
    }),
  });
};
