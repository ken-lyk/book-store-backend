import { z } from 'zod';

// Schema for user registration
export const registerSchema = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Name is required' })
            .min(2, 'Name must be at least 2 characters long'),
        email: z
            .string({ required_error: 'Email is required' })
            .email('Invalid email address'),
        password: z
            .string({ required_error: 'Password is required' })
            .min(6, 'Password must be at least 6 characters long'),
    }),
});

// Schema for user login
export const loginSchema = z.object({
    body: z.object({
        email: z
            .string({ required_error: 'Email is required' })
            .email('Invalid email address'),
        password: z
            .string({ required_error: 'Password is required' })
            .min(1, 'Password cannot be empty'),
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];