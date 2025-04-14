import { Request, Response, NextFunction } from 'express';
import { authorService } from '../services/AuthorService';

export const createAuthor = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Validation handled by middleware
        const author = await authorService.createAuthor(req.body);
        res.status(201).json({
            status: 'success',
            data: { author },
        });
    } catch (error) {
        next(error);
    }
};

export const getAllAuthors = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Add pagination/filtering options from req.query if needed
        const authors = await authorService.getAllAuthors(/* pass options here */);
        res.status(200).json({
            status: 'success',
            results: authors.length,
            data: { authors },
        });
    } catch (error) {
        next(error);
    }
};

export const getAuthorById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // ID validation handled by middleware
        const { id } = req.params;
        const author = await authorService.getAuthorById(id, { relations: ['books'] }); // Optionally load relations
        res.status(200).json({
            status: 'success',
            data: { author },
        });
    } catch (error) {
        next(error);
    }
};

export const updateAuthor = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // ID and body validation handled by middleware
        const { id } = req.params;
        const author = await authorService.updateAuthor(id, req.body);
        res.status(200).json({
            status: 'success',
            data: { author },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAuthor = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // ID validation handled by middleware
        const { id } = req.params;
        await authorService.deleteAuthor(id);
        // Send 204 No Content on successful deletion
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};