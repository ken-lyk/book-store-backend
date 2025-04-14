import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwtUtils';
import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entities/User';
import { AppError } from '../utils/AppError';


export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('Authentication required. No token provided.', 401));
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return next(new AppError('Invalid or expired token.', 401));
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: decoded.id } });

        if (!user) {
            return next(new AppError('User associated with this token no longer exists.', 401));
        }

        // Attach user to request (excluding password)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;

        next();
    } catch (error) {
        // Catch potential errors during DB lookup or token verification
        next(new AppError('Authentication failed.', 500, false));
    }
};

// Role-based authorization middleware factory
export const authorize = (allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            // Should have been caught by authenticate, but double-check
            return next(new AppError('Authentication required.', 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Forbidden: Role '${req.user.role}' is not authorized for this action.`,
                    403
                )
            );
        }
        next();
    };
};

export const isAdmin = authorize([UserRole.ADMIN]);
export const isUser = authorize([UserRole.USER, UserRole.ADMIN]); // Admins can usually do what users can