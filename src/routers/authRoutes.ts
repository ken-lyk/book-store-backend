import { Router } from 'express';
import * as AuthController from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema } from '../validators/authValidators';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and registration
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Creates a new user account with the 'USER' role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      user: { $ref: '#/components/schemas/UserResponse' }
 *       '400':
 *         description: Validation Error (invalid input)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '409':
 *         description: Conflict (email already in use)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/register', validateRequest(registerSchema), AuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     description: Authenticates a user and returns a JWT token along with user details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 token: { type: string, example: 'eyJhbGciOiJIUzI1NiIsIn...' }
 *                 data:
 *                   type: object
 *                   properties:
 *                      user: { $ref: '#/components/schemas/UserResponse' }
 *       '400':
 *         description: Validation Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401':
 *         description: Unauthorized (invalid email or password)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post('/login', validateRequest(loginSchema), AuthController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user details
 *     tags: [Auth]
 *     description: Retrieves the details of the currently authenticated user based on the provided JWT token.
 *     security:
 *       - bearerAuth: [] # Requires JWT token
 *     responses:
 *       '200':
 *         description: Current user data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                      user: { $ref: '#/components/schemas/UserResponse' }
 *       '401':
 *         description: Unauthorized (token invalid or missing)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/me', authenticate, AuthController.getMe);

export default router;