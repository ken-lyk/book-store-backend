import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError'; // Ensure path is correct

interface FormattedZodError {
    path: (string | number)[]; // Zod path can include numbers for array indices
    message: string;
}

/**
 * Middleware factory that generates an Express middleware function to validate
 * request's body, query parameters, and route parameters against a given Zod schema.
 *
 * @param schema - The Zod schema object to validate against.
 * @returns An Express middleware function.
 */
export const validateRequest =
    (schema: AnyZodObject) =>
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                // Asynchronously parse and validate the request parts against the schema
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });

                // If validation succeeds, pass control to the next middleware/handler
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    // Format Zod errors into a more readable structure
                    const formattedErrors: FormattedZodError[] = error.errors.map((err) => ({
                        path: err.path,
                        message: err.message,
                    }));

                    const validationError = new AppError(
                        'Validation failed. Please check your input.', // User-friendly message
                        400, // Bad Request status code
                        true // Mark as operational error (client input issue)
                        // You could add the detailed errors as an extra property if needed for debugging or specific front-end handling:
                        // , { details: formattedErrors } // Example of adding details
                    );

                    // Log the detailed validation errors for server-side debugging
                    console.error('Validation Error Details:', JSON.stringify(formattedErrors, null, 2));

                    // Pass the AppError to the global error handler
                    next(validationError);

                } else {
                    // Handle unexpected errors during the validation process itself
                    console.error('Unexpected error during validation:', error);
                    next(
                        new AppError(
                            'An internal error occurred during request validation.',
                            500,
                            false
                        )
                    );
                }
            }
        };