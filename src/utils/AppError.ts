export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Capture stack trace (optional but useful)
        Error.captureStackTrace(this, this.constructor);

        // Set the prototype explicitly for correct instance checking
        Object.setPrototypeOf(this, AppError.prototype);
    }
}