export default class AppError extends Error {
    statusCode: Number;
    status: string;
    path: any;
    constructor(statusCode: Number, message: string, path: any = false) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.path = !path ? false : path;
    }
}
