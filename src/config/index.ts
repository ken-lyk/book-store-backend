import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_DATABASE || 'book_review_db',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'supersecret',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
};