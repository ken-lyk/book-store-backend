import { Router } from 'express';
import * as AuthorController from '../controllers/AuthorController';
import { validateRequest } from '../middlewares/validateRequest';
import {
    createAuthorSchema,
    updateAuthorSchema,
    authorIdParamSchema,
} from '../validators/authorValidators';
import { authenticate, isAdmin } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: Operations related to authors. Authentication is required for listing/viewing, Admin rights required for modifications.
 */

// --- Authenticated Routes ---
// Apply authentication middleware to all author routes first.
// Specific admin authorization is applied per route where needed.
router.use(authenticate);

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: List all authors
 *     tags: [Authors]
 *     description: Retrieves a list of all authors in the system. Requires user authentication. Supports basic pagination via query parameters.
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication
 *     parameters:
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
 *         description: Maximum number of authors to return per page.
 *     responses:
 *       '200':
 *         description: A list of authors retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 totalResults: { type: integer, example: 15 } # Example total count
 *                 results: { type: integer, example: 10 } # Authors on this page
 *                 data:
 *                   type: object
 *                   properties:
 *                      authors:
 *                         type: array
 *                         items: { $ref: '#/components/schemas/AuthorResponse' } # May or may not include books depending on service implementation
 *       '401':
 *         description: Unauthorized - JWT token is missing or invalid.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', AuthorController.getAllAuthors);

/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Create a new author (Admin only)
 *     tags: [Authors]
 *     description: Adds a new author to the system. Requires ADMIN privileges.
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication and Admin role
 *     requestBody:
 *       required: true
 *       description: Author data to create. Currently only requires the author's name.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorInput'
 *     responses:
 *       '201':
 *         description: Author created successfully. Returns the newly created author data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      author: { $ref: '#/components/schemas/AuthorResponse' }
 *       '400':
 *         description: Validation Error (e.g., missing name, name too short/long).
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
router.post(
    '/',
    isAdmin,
    validateRequest(createAuthorSchema),
    AuthorController.createAuthor
);

/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Get a specific author by ID
 *     tags: [Authors]
 *     description: Retrieves detailed information about a single author, potentially including the books they have written. Requires user authentication.
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier (UUID) of the author.
 *     responses:
 *       '200':
 *         description: Detailed author information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      author: { $ref: '#/components/schemas/AuthorResponse' } # Assumes response schema might include books
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
 *       '404':
 *         description: Author not found for the given ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
    '/:id',
    validateRequest(authorIdParamSchema),
    AuthorController.getAuthorById
);

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Update an existing author (Admin only)
 *     tags: [Authors]
 *     description: Updates the details (e.g., name) of an existing author identified by their ID. Requires ADMIN privileges. At least one field must be provided.
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication and Admin role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier (UUID) of the author to update.
 *     requestBody:
 *       required: true
 *       description: Author data fields to update (e.g., name).
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthorInput' # Update often reuses the input schema or a partial version
 *             # Example for a partial update schema (if defined separately):
 *             # $ref: '#/components/schemas/UpdateAuthorInput'
 *     responses:
 *       '200':
 *         description: Author updated successfully. Returns the updated author data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      author: { $ref: '#/components/schemas/AuthorResponse' }
 *       '400':
 *         description: Validation Error (e.g., invalid ID format, invalid name, empty request body).
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
 *         description: Author not found for the given ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.put(
    '/:id',
    isAdmin,
    validateRequest(updateAuthorSchema),
    AuthorController.updateAuthor
);

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author (Admin only)
 *     tags: [Authors]
 *     description: Permanently deletes an author from the system. Requires ADMIN privileges. Deletion might be prevented if the author is associated with books (depending on service logic).
 *     security:
 *       - bearerAuth: [] # Requires JWT authentication and Admin role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique identifier (UUID) of the author to delete.
 *     responses:
 *       '204':
 *         description: Author deleted successfully. No content is returned.
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
 *         description: Author not found for the given ID.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '409':
 *         description: Conflict - Cannot delete author because they are associated with existing books (if this logic is implemented in the service).
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.delete(
    '/:id',
    isAdmin,
    validateRequest(authorIdParamSchema),
    AuthorController.deleteAuthor
);

export default router;
