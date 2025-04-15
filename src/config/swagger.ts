import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import { config } from './index'; // Your existing config for port/base URL

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Book Review System API',
        version: '1.0.0',
        description:
            'API documentation for the Book Review System, allowing management of users, books, authors, and reviews.',
        contact: {
            name: 'API Support',
            // url: 'http://www.example.com/support', // Optional
            // email: 'support@example.com', // Optional
        },
        license: { // Optional
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
    },
    servers: [
        {
            url: `http://localhost:${config.port}/api/v1`, // Base URL for API V1
            description: 'Development server',
        },
        // Add other servers like staging or production if needed
        // {
        //   url: `https://your-production-domain.com/api/v1`,
        //   description: 'Production server',
        // },
    ],
    // Define reusable components like schemas and security schemes
    components: {
        // Define schemas based on your entities/validators (omit sensitive data like passwords)
        schemas: {
            // --- User Schemas ---
            UserInput: { // Schema for Registration
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string', minLength: 2, example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                    password: { type: 'string', format: 'password', minLength: 6, example: 'password123' },
                },
            },
            LoginInput: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                    password: { type: 'string', format: 'password', example: 'password123' },
                },
            },
            UserResponse: { // Schema for User data in responses
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
                    name: { type: 'string', example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                    role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }, 
                },
            },
            // --- Author Schemas ---
            AuthorInput: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', minLength: 2, maxLength: 150, example: 'J.R.R. Tolkien' }
                }
            },
            AuthorResponse: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string', example: 'J.R.R. Tolkien' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }, 
                }
            },
            // --- Book Schemas ---
            CreateBookInput: {
                type: 'object',
                required: ['title', 'authorIds'],
                properties: {
                    title: { type: 'string', minLength: 1, maxLength: 200, example: 'The Hobbit' },
                    isbn: { type: 'string', maxLength: 20, nullable: true, example: '978-0547928227' },
                    authorIds: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' },
                        minItems: 1,
                        example: ['uuid-for-tolkien', 'uuid-for-another-author']
                    }
                }
            },
            UpdateBookInput: { // Similar to Create, but fields optional
                type: 'object',
                properties: {
                    title: { type: 'string', minLength: 1, maxLength: 200, example: 'The Hobbit' },
                    isbn: { type: 'string', maxLength: 20, nullable: true, example: '978-0547928227' },
                    authorIds: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' },
                        minItems: 1,
                    }
                }
            },
            BookResponse: { // Response including authors
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string', example: 'The Hobbit' },
                    isbn: { type: 'string', nullable: true, example: '978-0547928227' },
                    authors: { type: 'array', items: { $ref: '#/components/schemas/AuthorResponse' } }, // Embed Author summary
                    // reviews: { type: 'array', items: { $ref: '#/components/schemas/ReviewResponse' } }, // Embed Reviews
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                }
            },
            BookSummary: { // For embedding in Author to avoid circular refs
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    title: { type: 'string' },
                    isbn: { type: 'string', nullable: true },
                }
            },
            // --- Review Schemas ---
            CreateReviewInput: {
                type: 'object',
                required: ['rating', 'bookId'],
                properties: {
                    rating: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
                    comment: { type: 'string', nullable: true, example: 'A fantastic adventure!' },
                    bookId: { type: 'string', format: 'uuid', example: 'uuid-for-the-hobbit' }
                }
            },
            UpdateReviewInput: {
                type: 'object',
                properties: {
                    rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                    comment: { type: 'string', nullable: true, example: 'An absolute classic!' }
                }
            },
            ReviewResponse: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    rating: { type: 'integer', example: 4 },
                    comment: { type: 'string', nullable: true, example: 'A fantastic adventure!' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    user: { $ref: '#/components/schemas/UserResponse' }, // Embed safe user data
                    book: { $ref: '#/components/schemas/BookSummary' }, // Embed book summary
                }
            },
            // --- General Error Schemas ---
            ErrorResponse: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'error' },
                    message: { type: 'string', example: 'Resource not found' },
                }
            }
        },
        // Define security scheme for JWT Bearer token
        securitySchemes: {
            bearerAuth: { // Can be any name, referenced in 'security' below
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT', // Optional, for documentation purposes
                description: 'Input your JWT Bearer token in the format: Bearer <token>',
            },
        },
    },
    // Apply security globally (can be overridden per-operation)
    // security: [
    //   {
    //     bearerAuth: [], // Requires the 'bearerAuth' scheme defined above
    //   },
    // ],
};

// Options for swagger-jsdoc
const options: Options = {
    definition: swaggerDefinition,
    // Path to the API specs (route files containing JSDoc comments)
    apis: ['src/routers/authorRoutes.ts',
        'src/routers/authRoutes.ts',
        'src/routers/bookRoutes.ts',
        'src/routers/reviewRoutes.ts',
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;