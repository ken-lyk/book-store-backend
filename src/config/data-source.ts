import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './index';
import { User } from '../entities/User';
import { Book } from '../entities/Book';
import { Author } from '../entities/Author';
import { Review } from '../entities/Review';

export const AppDataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: config.db.host,
    port: config.db.port,
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    synchronize: false, // Never use TRUE in production! Use migrations.
    logging: process.env.NODE_ENV === 'development', // Log SQL in dev
    entities: [User, Book, Author, Review],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'], // Path to migrations
    subscribers: [],
};

export const AppDataSource = new DataSource(AppDataSourceOptions);