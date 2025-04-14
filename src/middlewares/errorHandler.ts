import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { QueryFailedError } from 'typeorm';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): void => {
    console.error('ERROR 💥:', err);

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            // Only send stack in development or if it's an operational error we trust
            ...(process.env.NODE_ENV === 'development' || err.isOperational
                ? { stack: err.stack }
                : {}),
        });
    } else if (err instanceof QueryFailedError && err.message.includes('Duplicate entry')) {
        // Handle specific database errors like unique constraints
        res.status(409).json({ // 409 Conflict
            status: 'error',
            message: 'Database conflict: A record with this value already exists.',
            // You might parse the error message for more details if needed
        });
    }
    // Add more specific error handlers here (e.g., ZodError if not handled in middleware, TypeORM errors)
    else {
        // Generic Internal Server Error for unexpected issues
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
            // Avoid leaking sensitive error details in production
            ...(process.env.NODE_ENV === 'development' ? { error: err.toString(), stack: err.stack } : {}),
        });
    }
};