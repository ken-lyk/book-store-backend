import { z } from 'zod';

const uuidMessage = 'Invalid UUID format';

// Schema for validating UUID in route parameters
export const bookIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(uuidMessage),
    }),
});

// Schema for creating a new book
export const createBookSchema = z.object({
    body: z.object({
        title: z
            .string({ required_error: 'Book title is required' })
            .min(1, 'Book title cannot be empty')
            .max(200, 'Book title must be 200 characters or less'),
        isbn: z
            .string()
            .max(20, 'ISBN must be 20 characters or less')
            .optional()
            .nullable(), // Allow null or omit
        authorIds: z
            .array(z.string().uuid(uuidMessage), {
                required_error: 'Author IDs are required',
                invalid_type_error: 'Author IDs must be an array of UUID strings',
            })
            .min(1, 'At least one author ID is required'),
    }),
});

// Schema for updating an existing book
export const updateBookSchema = z.object({
    params: z.object({
        id: z.string().uuid(uuidMessage),
    }),
    body: z
        .object({
            title: z
                .string()
                .min(1, 'Book title cannot be empty')
                .max(200, 'Book title must be 200 characters or less')
                .optional(),
            isbn: z
                .string()
                .max(20, 'ISBN must be 20 characters or less')
                .optional()
                .nullable(), // Allow setting ISBN to null or updating it
            authorIds: z
                .array(z.string().uuid(uuidMessage), {
                    invalid_type_error: 'Author IDs must be an array of UUID strings',
                })
                .min(1, 'At least one author ID is required')
                .optional(),
        })
        .strict() // Disallow extra fields
        .refine(
            (data) => Object.keys(data).length > 0,
            'At least one field must be provided for update'
        ),
});

export type CreateBookInput = z.infer<typeof createBookSchema>['body'];
export type UpdateBookInput = z.infer<typeof updateBookSchema>['body'];
export type BookIdParam = z.infer<typeof bookIdParamSchema>['params'];