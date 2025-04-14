import app from './app';
import { AppDataSource } from './config/data-source';
import { config } from './config';

const startServer = async () => {
    try {
        // Initialize database connection
        await AppDataSource.initialize();
        console.log('Database connection initialized successfully.');

        // Start Express server
        const port = config.port;
        const server = app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

        // Graceful shutdown handling
        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('HTTP server closed');
                AppDataSource.destroy().then(() => {
                    console.log('Database connection closed.');
                    process.exit(0);
                }).catch(err => {
                    console.error('Error closing database connection:', err);
                    process.exit(1);
                });
            });
        });

    } catch (error) {
        console.error('Failed to initialize database or start server:', error);
        process.exit(1);
    }
};

startServer();