import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/ReviewService';
import { AppError } from '../utils/AppError';
import { ListReviewsQuery } from '../validators/reviewValidators'; // Import query type

export const createReview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Validation handled by middleware
        if (!req.user) {
            // Should be caught by `authenticate` middleware, but good practice to check
            return next(new AppError('You must be logged in to create a review', 401));
        }
        // Pass review data and the authenticated user's info to the service
        const review = await reviewService.createReview(req.body, { id: req.user.id, role: req.user.role });
        res.status(201).json({
            status: 'success',
            data: { review },
        });
    } catch (error) {
        next(error);
    }
};

export const getAllReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Query validation handled by middleware
        const queryParams: ListReviewsQuery = {
            page: req.query.page ? Number(req.query.page) : 1,
            limit: req.query.limit ? Number(req.query.limit) : 10,
            bookId: req.query.bookId as string | undefined,
            userId: req.query.userId as string | undefined
        };
        const { reviews, total } = await reviewService.getAllReviews(queryParams);
        // TODO: Add pagination metadata to response if needed (totalPages, currentPage, etc.)
        res.status(200).json({
            status: 'success',
            totalResults: total, // Total number of reviews matching filter
            results: reviews.length, // Number of results in this page
            data: { reviews },
        });
    } catch (error) {
        next(error);
    }
};

export const getReviewById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // ID validation handled by middleware
        const { id } = req.params;
        const review = await reviewService.getReviewById(id); // Service loads relations
        res.status(200).json({
            status: 'success',
            data: { review },
        });
    } catch (error) {
        next(error);
    }
};

export const updateReview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // ID and body validation handled by middleware
        if (!req.user) {
            return next(new AppError('Authentication required.', 401));
        }
        const { id } = req.params;
        // Pass update data and authenticated user for authorization checks in the service
        const review = await reviewService.updateReview(id, req.body, { id: req.user.id, role: req.user.role });
        res.status(200).json({
            status: 'success',
            data: { review },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // ID validation handled by middleware
        if (!req.user) {
            return next(new AppError('Authentication required.', 401));
        }
        const { id } = req.params;
        // Pass review ID and authenticated user for authorization checks in the service
        await reviewService.deleteReview(id, { id: req.user.id, role: req.user.role });
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};