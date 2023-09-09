export default class AppError extends Error {
    statusCode: Number;
    status: string;
    path: any;
    constructor(
        statusCode: Number,
        status: string,
        message: string,
        path = false
    ) {
        super(message);
        this.statusCode = statusCode;
        this.status = status;
        this.message = message;
        this.path = !path ? false : path;
    }
}
