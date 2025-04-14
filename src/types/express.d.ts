import { User } from "entities/User";

// Extend the Express Request interface
declare global {
    namespace Express {
        interface Request {
            user?: Omit<User, 'password'>; // Add user property, exclude password
        }
    }
}

// Export something to make it a module (even if empty)
export { };