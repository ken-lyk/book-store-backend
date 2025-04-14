import { z } from 'zod';

const uuidMessage = 'Invalid UUID format';

// Schema for validating UUID in route parameters
export const reviewIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid(uuidMessage),
    }),
});

// Schema for creating a new review
export const createReviewSchema = z.object({
    body: z.object({
        rating: z
            .number({
                required_error: 'Rating is required',
                invalid_type_error: 'Rating must be a number',
            })
            .int('Rating must be an integer')
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating must be at most 5'),
        comment: z.string().optional(), // Comment is optional
        bookId: z // The ID of the book being reviewed
            .string({ required_error: 'Book ID is required' })
            .uuid(uuidMessage),
        // userId is automatically added from the authenticated user (req.user.id) in the service/controller
    }),
});

// Schema for updating an existing review
// Users should only be able to update their own rating and comment
export const updateReviewSchema = z.object({
    params: z.object({
        id: z.string().uuid(uuidMessage),
    }),
    body: z
        .object({
            rating: z
                .number({ invalid_type_error: 'Rating must be a number' })
                .int('Rating must be an integer')
                .min(1, 'Rating must be at least 1')
                .max(5, 'Rating must be at most 5')
                .optional(),
            comment: z.string().optional().nullable(), // Allow clearing the comment by sending null
        })
        .strict() // Disallow updating bookId or userId via this endpoint
        .refine(
            (data) => data.rating !== undefined || data.comment !== undefined,
            'At least rating or comment must be provided for update'
        ), // Ensure at least one field is present
});

// (Optional) Schema for list reviews query parameters (example)
export const listReviewsQuerySchema = z.object({
    query: z.object({
        bookId: z.string().uuid(uuidMessage).optional(),
        userId: z.string().uuid(uuidMessage).optional(),
        page: z.coerce.number().int().positive().optional().default(1), // Default to page 1
        limit: z.coerce.number().int().positive().optional().default(10), // Default to 10 per page
    }),
});


// Type definitions (optional)
export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>['body'];
export type ReviewIdParam = z.infer<typeof reviewIdParamSchema>['params'];
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>['query'];