import { Router } from 'express';
import * as ReviewController from '../controllers/ReviewController';
import { validateRequest } from '../middlewares/validateRequest';
import {
    createReviewSchema,
    updateReviewSchema,
    reviewIdParamSchema,
    listReviewsQuerySchema, // Use the specific query validator
} from '../validators/reviewValidators';
import { authenticate } from '../middlewares/authMiddleware'; // Authentication needed for write operations

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Operations related to book reviews. Public users can list and view reviews. Authenticated users can create reviews, and update/delete their own reviews (or any review if Admin).
 */

// --- Public Routes ---

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: List reviews
 *     tags: [Reviews]
 *     description: Retrieves a list of reviews. Publicly accessible. Supports filtering by book ID or user ID, and pagination.
 *     parameters:
 *       - in: query
 *         name: bookId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter reviews by the ID of the book being reviewed.
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter reviews by the ID of the user who wrote them.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of reviews to return per page.
 *     responses:
 *       '200':
 *         description: A list of reviews retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 totalResults: { type: integer, example: 50 } # Total matching reviews
 *                 results: { type: integer, example: 10 } # Reviews in this page
 *                 data:
 *                   type: object
 *                   properties:
 *                      reviews:
 *                         type: array
 *                         items: { $ref: '#/components/schemas/ReviewResponse' } # Includes user and book summary
 *       '400':
 *         description: Validation Error - Invalid format for query parameters (e.g., non-UUID ID, non-integer page/limit).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', validateRequest(listReviewsQuerySchema), ReviewController.getAllReviews);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a specific review by ID
 *     tags: [Reviews]
 *     description: Retrieves detailed information about a single review, including the user who wrote it and the book it refers to. Publicly accessible.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier (UUID) of the review.
 *     responses:
 *       '200':
 *         description: Detailed review information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      review: { $ref: '#/components/schemas/ReviewResponse' }
 *       '400':
 *         description: Validation Error - Invalid ID format provided.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '404':
 *         description: Review not found for the given ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:id', validateRequest(reviewIdParamSchema), ReviewController.getReviewById);


// --- Authenticated User Routes ---

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     description: Adds a new review for a specific book. Requires user authentication. A user can typically only review a specific book once.
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication
 *     requestBody:
 *       required: true
 *       description: Review data, including rating and the ID of the book being reviewed.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewInput'
 *     responses:
 *       '201':
 *         description: Review created successfully. Returns the newly created review data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      review: { $ref: '#/components/schemas/ReviewResponse' }
 *       '400':
 *         description: Validation Error (e.g., missing fields, invalid rating, book ID not found or invalid format).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '404':
 *         description: Not Found - The specified Book ID does not exist.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '409':
 *         description: Conflict - User has already submitted a review for this book.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/', authenticate, validateRequest(createReviewSchema), ReviewController.createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update an existing review
 *     tags: [Reviews]
 *     description: Updates the rating and/or comment of an existing review identified by its ID. Requires user authentication. Users can only update their own reviews, unless they are an ADMIN.
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier (UUID) of the review to update.
 *     requestBody:
 *       required: true
 *       description: Review data fields (rating and/or comment) to update. At least one field must be provided.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReviewInput'
 *     responses:
 *       '200':
 *         description: Review updated successfully. Returns the updated review data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      review: { $ref: '#/components/schemas/ReviewResponse' }
 *       '400':
 *         description: Validation Error (e.g., invalid ID format, invalid rating, empty request body).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '403':
 *         description: Forbidden - User is not the owner of the review and is not an ADMIN.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '404':
 *         description: Review not found for the given ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put('/:id', authenticate, validateRequest(updateReviewSchema), ReviewController.updateReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     description: Permanently deletes a review identified by its ID. Requires user authentication. Users can only delete their own reviews, unless they are an ADMIN.
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier (UUID) of the review to delete.
 *     responses:
 *       '204':
 *         description: Review deleted successfully. No content is returned.
 *       '400':
 *         description: Validation Error - Invalid ID format provided.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '403':
 *         description: Forbidden - User is not the owner of the review and is not an ADMIN.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '404':
 *         description: Review not found for the given ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete('/:id', authenticate, validateRequest(reviewIdParamSchema), ReviewController.deleteReview);

export default router;