class AppError extends Error {
    constructor(statusCode, status, message, path = false) {
        super(message);
        this.statusCode = statusCode;
        this.status = status;
        this.message = message;
        this.path = !path ? false : path;
    }
}

module.exports = AppError;
