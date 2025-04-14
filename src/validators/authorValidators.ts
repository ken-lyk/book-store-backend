import { z } from 'zod';

const uuidMessage = 'Invalid UUID format';

// Schema for validating UUID in route parameters
export const authorIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(uuidMessage),
    }),
});

// Schema for creating a new author
export const createAuthorSchema = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Author name is required' })
            .min(2, 'Author name must be at least 2 characters long')
            .max(150, 'Author name must be 150 characters or less'),
        // Add other fields like 'bio' if you include them in the entity
        // bio: z.string().optional(),
    }),
});

// Schema for updating an existing author
export const updateAuthorSchema = z.object({
    params: z.object({
        id: z.string().uuid(uuidMessage),
    }),
    body: z
        .object({
            name: z
                .string()
                .min(2, 'Author name must be at least 2 characters long')
                .max(150, 'Author name must be 150 characters or less')
                .optional(),
            // bio: z.string().optional(),
        })
        .strict() // Prevent extra fields in the update body
        .refine(
            (data) => Object.keys(data).length > 0,
            'At least one field must be provided for update'
        ), // Ensure body is not empty
});

// Type definitions (optional)
export type CreateAuthorInput = z.infer<typeof createAuthorSchema>['body'];
export type UpdateAuthorInput = z.infer<typeof updateAuthorSchema>['body'];
export type AuthorIdParam = z.infer<typeof authorIdParamSchema>['params'];