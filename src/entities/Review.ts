import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Book } from './Book';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'int' }) // Example: 1 to 5 stars
    rating!: number;

    @Column({ type: 'text', nullable: true })
    comment?: string;

    @ManyToOne(() => User, user => user.reviews, { nullable: false, onDelete: 'CASCADE' }) // Delete review if user is deleted
    @JoinColumn({ name: 'userId' }) // Explicitly define foreign key column name
    user!: User;

    @Column() // TypeORM automatically creates userId based on relation
    userId!: string;

    @ManyToOne(() => Book, book => book.reviews, { nullable: false, onDelete: 'CASCADE' }) // Delete review if book is deleted
    @JoinColumn({ name: 'bookId' })
    book!: Book;

    @Column()
    bookId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}