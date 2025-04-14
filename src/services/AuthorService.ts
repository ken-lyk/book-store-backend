import { AppDataSource } from '../config/data-source';
import { Author } from '../entities/Author';
import { Book } from '../entities/Book';
import { AppError } from '../utils/AppError';
import { CreateAuthorInput, UpdateAuthorInput } from '../validators/authorValidators'; // Assuming types exported
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';

export class AuthorService {
    private authorRepository: Repository<Author>;
    private bookRepository: Repository<Book>; // Needed for cascade checks potentially

    constructor() {
        this.authorRepository = AppDataSource.getRepository(Author);
        this.bookRepository = AppDataSource.getRepository(Book);
    }

    async createAuthor(authorData: CreateAuthorInput): Promise<Author> {
        const author = this.authorRepository.create(authorData);
        await this.authorRepository.save(author);
        return author;
    }

    async getAllAuthors(options?: FindManyOptions<Author>): Promise<Author[]> {
        // Example: Add default ordering or allow options from controller
        return this.authorRepository.find({ order: { name: 'ASC' }, ...options });
    }

    async getAuthorById(id: string, options?: FindOneOptions<Author>): Promise<Author> {
        const author = await this.authorRepository.findOne({ where: { id }, ...options });
        if (!author) {
            throw new AppError('Author not found', 404);
        }
        return author;
    }

    async updateAuthor(id: string, updateData: UpdateAuthorInput): Promise<Author> {
        // Use getAuthorById to ensure it exists first (includes 404 check)
        const author = await this.getAuthorById(id);

        // Merge updates the entity instance, save persists changes
        this.authorRepository.merge(author, updateData);
        await this.authorRepository.save(author);
        return author;
    }

    async deleteAuthor(id: string): Promise<void> {
        // Fetch the author with related books to check for associations
        const author = await this.authorRepository.findOne({
            where: { id },
            relations: ['books'], // Load associated books
        });

        if (!author) {
            throw new AppError('Author not found', 404);
        }

        // --- Cascade Handling Decision ---
        // Option 1: Prevent deletion if books are associated (Safer)
        if (author.books && author.books.length > 0) {
            throw new AppError(
                'Cannot delete author with associated books. Please remove book associations first.',
                409 // Conflict
            );
        }

        // Option 2: Allow deletion (might orphan book entries in junction table if DB FK cascade not set)
        // No explicit check needed here if you choose this path.

        // Option 3: Manually remove associations (Complex)
        // Not implemented here for brevity.
        // --- End Cascade Handling Decision ---

        const deleteResult = await this.authorRepository.delete(id);

        if (!deleteResult.affected || deleteResult.affected === 0) {
            // This case might occur in race conditions or if the author was deleted between findOne and delete
            throw new AppError('Author not found or could not be deleted', 404);
        }
    }
}

export const authorService = new AuthorService();