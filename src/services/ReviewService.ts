import { AppDataSource } from '../config/data-source';
import { Review } from '../entities/Review';
import { Book } from '../entities/Book';
import { User, UserRole } from '../entities/User';
import { AppError } from '../utils/AppError';
import { CreateReviewInput, UpdateReviewInput, ListReviewsQuery } from '../validators/reviewValidators'; // Assuming types exported
import { Repository, FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';

// Type for authenticated user data passed to service methods
type AuthenticatedUser = {
    id: string;
    role: UserRole;
};

export class ReviewService {
    private reviewRepository: Repository<Review>;
    private bookRepository: Repository<Book>; // To check if book exists

    constructor() {
        this.reviewRepository = AppDataSource.getRepository(Review);
        this.bookRepository = AppDataSource.getRepository(Book);
    }

    async createReview(
        reviewData: CreateReviewInput,
        authenticatedUser: AuthenticatedUser // Pass authenticated user's ID and Role
    ): Promise<Review> {
        const { bookId, rating, comment } = reviewData;
        const userId = authenticatedUser.id;

        // 1. Check if the book exists
        const bookExists = await this.bookRepository.exist({ where: { id: bookId } });
        if (!bookExists) {
            throw new AppError('Book not found', 404);
        }

        // 2. Optional: Check if user already reviewed this book
        const existingReview = await this.reviewRepository.findOneBy({ userId, bookId });
        if (existingReview) {
            throw new AppError('You have already submitted a review for this book', 409); // Conflict
        }

        // 3. Create and save the review
        const review = this.reviewRepository.create({
            rating,
            comment,
            bookId,
            userId, // Set the user ID from the authenticated user
        });

        await this.reviewRepository.save(review);
        // Consider loading relations 'user' and 'book' if needed immediately after creation
        return this.getReviewById(review.id); // Reload to include relations
    }

    async getAllReviews(query: ListReviewsQuery): Promise<{ reviews: Review[], total: number }> {
        const { bookId, userId, page = 1, limit = 10 } = query;

        const where: FindOptionsWhere<Review> = {};
        if (bookId) where.bookId = bookId;
        if (userId) where.userId = userId;

        const skip = (page - 1) * limit;

        const [reviews, total] = await this.reviewRepository.findAndCount({
            where,
            relations: ['user', 'book'], // Load relations
            order: { createdAt: 'DESC' },
            skip: skip,
            take: limit,
        });

        // Remove passwords from user data in reviews
        const safeReviews = reviews.map(review => {
            if (review.user) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password, ...safeUser } = review.user;
                review.user = safeUser as User;
            }
            return review;
        });


        return { reviews: safeReviews, total };
    }

    async getReviewById(id: string, options?: FindOneOptions<Review>): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['user', 'book'], // Load relations
            ...options
        });

        if (!review) {
            throw new AppError('Review not found', 404);
        }

        // Remove password from user data
        if (review.user) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...safeUser } = review.user;
            review.user = safeUser as User;
        }

        return review;
    }

    async updateReview(
        id: string,
        updateData: UpdateReviewInput,
        authenticatedUser: AuthenticatedUser
    ): Promise<Review> {
        const review = await this.reviewRepository.findOneBy({ id });

        if (!review) {
            throw new AppError('Review not found', 404);
        }

        // Authorization Check: User must own the review OR be an admin
        if (
            review.userId !== authenticatedUser.id &&
            authenticatedUser.role !== UserRole.ADMIN
        ) {
            throw new AppError(
                'Forbidden: You are not authorized to update this review',
                403
            );
        }

        // Convert null comment to undefined to satisfy DeepPartial<Review>
        const sanitizedUpdateData = {
            ...updateData,
            comment: updateData.comment === null ? undefined : updateData.comment
        };

        this.reviewRepository.merge(review, sanitizedUpdateData);
        await this.reviewRepository.save(review);
        return this.getReviewById(id); // Reload to include relations and safe user
    }

    async deleteReview(id: string, authenticatedUser: AuthenticatedUser): Promise<void> {
        const review = await this.reviewRepository.findOneBy({ id });

        if (!review) {
            throw new AppError('Review not found', 404);
        }

        // Authorization Check: User must own the review OR be an admin
        if (
            review.userId !== authenticatedUser.id &&
            authenticatedUser.role !== UserRole.ADMIN
        ) {
            throw new AppError(
                'Forbidden: You are not authorized to delete this review',
                403
            );
        }

        const deleteResult = await this.reviewRepository.delete(id);

        if (!deleteResult.affected || deleteResult.affected === 0) {
            throw new AppError('Review not found or could not be deleted', 404);
        }
    }
}

export const reviewService = new ReviewService();