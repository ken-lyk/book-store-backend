import 'reflect-metadata'; // Must be imported first for TypeORM
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import apiRouter from './routers/index';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';
import swaggerUi from 'swagger-ui-express'; // Import swagger UI
import swaggerSpec from './config/swagger'; // Import the generated spec

const app: Application = express();

// 1. Core Middlewares
app.use(cors()); // Configure CORS appropriately for production
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Swagger UI Setup ---
// Serve Swagger UI documentation at the /api-docs route
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    // explorer: true, // Optional: Adds a search bar
    // customCss: '.swagger-ui .topbar { display: none }' // Optional: Custom CSS
}));
// Serve the raw swagger JSON spec at /api-docs.json
app.get('/api/v1/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
// --- End Swagger UI Setup ---

// 2. API Routes
app.get('/', (req: Request, res: Response) => { // Simple health check / base route
    res.status(200).json({ message: 'Book Review API is running!' });
});
app.use('/api/v1', apiRouter); // Prefix routes with /api/v1

// 3. Not Found Handler (404) - Should be after all routes
app.all(/(.*)/, (req: Request, res: Response, next) => {
    if (!req.path.startsWith('/api-docs')) {
        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    } else {
        next(); // Allow swagger-ui-express internal routes to pass
    }
});

// 4. Global Error Handler - Must be the last middleware
app.use(errorHandler);

export default app;