import { AppDataSource } from '../config/data-source';
import { Book } from '../entities/Book';
import { Author } from '../entities/Author';
import { AppError } from '../utils/AppError';
import { CreateBookInput, UpdateBookInput } from '../validators/bookValidators'; // Assuming types exported
import { Repository, In, FindManyOptions, FindOneOptions } from 'typeorm';
import { User } from 'entities/User';

export class BookService {
    private bookRepository: Repository<Book>;
    private authorRepository: Repository<Author>;

    constructor() {
        this.bookRepository = AppDataSource.getRepository(Book);
        this.authorRepository = AppDataSource.getRepository(Author);
        // this.reviewRepository = AppDataSource.getRepository(Review);
    }

    async createBook(bookData: CreateBookInput): Promise<Book> {
        const { authorIds, ...restData } = bookData;

        // 1. Find associated authors
        const authors = await this.authorRepository.findBy({ id: In(authorIds) });

        // 2. Validate if all requested authors were found
        if (authors.length !== authorIds.length) {
            const foundIds = authors.map((a) => a.id);
            const notFoundIds = authorIds.filter((id) => !foundIds.includes(id));
            throw new AppError(`Author(s) not found: ${notFoundIds.join(', ')}`, 400);
        }

        // 3. Create the book entity and assign authors
        const book = this.bookRepository.create({
            isbn: restData.isbn ?? '',
            title: restData.title ?? '',
            authors: authors, // Assign the actual Author entities
        });

        // 4. Save (TypeORM handles junction table due to cascade option on relation)
        await this.bookRepository.save(book);
        return book; // Consider reloading relations if needed immediately
    }

    async getAllBooks(options?: FindManyOptions<Book>): Promise<Book[]> {
        return this.bookRepository.find({
            relations: ['authors', 'reviews'],
            order: { title: 'ASC' },
            ...options
        });
    }

    async getBookById(id: string, options?: FindOneOptions<Book>): Promise<Book> {
        const book = await this.bookRepository.findOne({
            where: { id },
            relations: ['authors', 'reviews', 'reviews.user'],
            ...options
        });

        if (!book) {
            throw new AppError('Book not found', 404);
        }
        // Manually remove password from nested user objects if loaded
        if (book.reviews) {
            book.reviews.forEach(review => {
                if (review.user) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { password, ...safeUser } = review.user;
                    review.user = safeUser as User; // Cast back to User type after removing password
                }
            });
        }

        return book;
    }

    async updateBook(id: string, updateData: UpdateBookInput): Promise<Book> {
        const book = await this.getBookById(id, { relations: ['authors'] });
        const { authorIds, ...restUpdateData } = updateData;

        let authorsToAssign: Author[] | undefined = undefined;

        if (authorIds) {
            authorsToAssign = await this.authorRepository.findBy({ id: In(authorIds) });
            if (authorsToAssign.length !== authorIds.length) {
                const foundIds = authorsToAssign.map((a) => a.id);
                const notFoundIds = authorIds.filter((id) => !foundIds.includes(id));
                throw new AppError(`Author(s) not found for update: ${notFoundIds.join(', ')}`, 400);
            }
        }

        this.bookRepository.merge(book, {
            isbn : restUpdateData.isbn ?? '',
            title: restUpdateData.title ?? ''
        });

        if (authorsToAssign !== undefined) {
            book.authors = authorsToAssign;
        }

        await this.bookRepository.save(book);
        return book;
    }

    async deleteBook(id: string): Promise<void> {
        const book = await this.bookRepository.findOneBy({ id });
        if (!book) {
            throw new AppError('Book not found', 404);
        }

        const deleteResult = await this.bookRepository.delete(id);
        if (!deleteResult.affected || deleteResult.affected === 0) {
            throw new AppError('Book not found or could not be deleted', 404);
        }
    }
}

export const bookService = new BookService();