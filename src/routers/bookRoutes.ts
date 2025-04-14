import { Router } from 'express';
import * as BookController from '../controllers/BookController';
import { validateRequest } from '../middlewares/validateRequest';
import {
    createBookSchema,
    updateBookSchema,
    bookIdParamSchema,
} from '../validators/bookValidators';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Operations related to books, including creation, retrieval, updating, and deletion. Admin rights are required for modification endpoints.
 */

// --- Public Routes ---

/**
 * @swagger
 * /books:
 *   get:
 *     summary: List all books
 *     tags: [Books]
 *     description: Retrieves a list of all available books. This endpoint is publicly accessible. Supports basic pagination.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (results are calculated based on limit).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of books to return per page.
 *       # Add other potential filtering parameters here if implemented (e.g., authorId, genre)
 *       # - in: query
 *       #   name: authorId
 *       #   schema:
 *       #     type: string
 *       #     format: uuid
 *       #   description: Filter books by author ID
 *     responses:
 *       '200':
 *         description: A list of books retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 totalResults: { type: integer, example: 25 } # Example total count if pagination implemented
 *                 results: { type: integer, example: 10 } # Number of items returned in this page
 *                 data:
 *                   type: object
 *                   properties:
 *                      books:
 *                         type: array
 *                         items: { $ref: '#/components/schemas/BookResponse' } # Assumes BookResponse includes authors
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', BookController.getAllBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a specific book by ID
 *     tags: [Books]
 *     description: Retrieves detailed information about a single book, including its authors and reviews (if available). Publicly accessible.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier (UUID) of the book.
 *     responses:
 *       '200':
 *         description: Detailed book information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      book: { $ref: '#/components/schemas/BookResponse' } # Assumes BookResponse includes authors/reviews
 *       '400':
 *         description: Validation Error - Invalid ID format provided.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '404':
 *         description: Book not found for the given ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/:id', validateRequest(bookIdParamSchema), BookController.getBookById);


// --- Admin Only Routes ---
// These routes require authentication (JWT Bearer Token) and ADMIN role.

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book (Admin only)
 *     tags: [Books]
 *     description: Adds a new book to the system. Requires ADMIN privileges. Associates the book with provided author IDs.
 *     security:
 *       - bearerAuth: [] # Indicates that JWT authentication is required
 *     requestBody:
 *       required: true
 *       description: Book data to create. `authorIds` must contain valid UUIDs of existing authors.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookInput'
 *     responses:
 *       '201':
 *         description: Book created successfully. Returns the newly created book data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      book: { $ref: '#/components/schemas/BookResponse' }
 *       '400':
 *         description: Validation Error (e.g., missing required fields, invalid author ID format, author ID not found).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '403':
 *         description: Forbidden - User does not have ADMIN role.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/', authenticate, isAdmin, validateRequest(createBookSchema), BookController.createBook);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update an existing book (Admin only)
 *     tags: [Books]
 *     description: Updates details of an existing book identified by its ID. Requires ADMIN privileges. At least one field must be provided in the request body. Updating `authorIds` will replace the existing author associations.
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier (UUID) of the book to update.
 *     requestBody:
 *       required: true
 *       description: Book data fields to update.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBookInput'
 *     responses:
 *       '200':
 *         description: Book updated successfully. Returns the updated book data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      book: { $ref: '#/components/schemas/BookResponse' }
 *       '400':
 *         description: Validation Error (e.g., invalid ID format, empty request body, invalid author ID format, author ID not found).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '403':
 *         description: Forbidden - User does not have ADMIN role.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '404':
 *         description: Book not found for the given ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put('/:id', authenticate, isAdmin, validateRequest(updateBookSchema), BookController.updateBook);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book (Admin only)
 *     tags: [Books]
 *     description: Permanently deletes a book from the system, including its associations with authors and related reviews (due to database cascade settings). Requires ADMIN privileges.
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier (UUID) of the book to delete.
 *     responses:
 *       '204':
 *         description: Book deleted successfully. No content is returned.
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
 *         description: Forbidden - User does not have ADMIN role.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '404':
 *         description: Book not found for the given ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete('/:id', authenticate, isAdmin, validateRequest(bookIdParamSchema), BookController.deleteBook);

export default router;