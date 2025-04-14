import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService'; // Import the instance
import { AppError } from '../utils/AppError';

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Input validation is handled by middleware (validateRequest)
        const user = await authService.registerUser(req.body);
        // Send back the created user data (without password)
        res.status(201).json({
            status: 'success',
            data: { user },
        });
    } catch (error) {
        next(error); // Pass error to the global error handler
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Input validation is handled by middleware
        const { user, token } = await authService.loginUser(req.body);

        res.status(200).json({
            status: 'success',
            token,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.user) {
        return next(new AppError('Authentication required.', 401));
    }

    // The `req.user` object already contains the user data (without password)
    res.status(200).json({
        status: 'success',
        data: { user: req.user },
    });
};
