import { Request, Response, NextFunction } from 'express';
import { bookService } from '../services/BookService';

export const createBook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Validation handled by middleware
        const book = await bookService.createBook(req.body);
        res.status(201).json({
            status: 'success',
            data: { book },
        });
    } catch (error) {
        next(error);
    }
};

export const getAllBooks = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Add pagination/filtering based on req.query if needed
        const books = await bookService.getAllBooks({ relations: ['authors'] }); // Load authors by default
        res.status(200).json({
            status: 'success',
            results: books.length,
            data: { books },
        });
    } catch (error) {
        next(error);
    }
};

export const getBookById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // ID validation handled by middleware
        const { id } = req.params;
        // Load authors and reviews for detailed view
        const book = await bookService.getBookById(id, { relations: ['authors', 'reviews', 'reviews.user'] });
        res.status(200).json({
            status: 'success',
            data: { book },
        });
    } catch (error) {
        next(error);
    }
};

export const updateBook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // ID and body validation handled by middleware
        const { id } = req.params;
        const book = await bookService.updateBook(id, req.body);
        res.status(200).json({
            status: 'success',
            data: { book },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteBook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // ID validation handled by middleware
        const { id } = req.params;
        await bookService.deleteBook(id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};