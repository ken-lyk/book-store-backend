import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Review } from './Review';
import { Author } from './Author';

@Entity('books')
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 200 })
    title!: string;

    @Column({ length: 20, nullable: true, unique: true }) // ISBN can be optional/unique
    isbn?: string;

    @ManyToMany(() => Author, author => author.books, { cascade: ['insert', 'update'] }) // Cascade only insert/update, handle delete manually or configure DB cascade
    @JoinTable({ // Join table definition is usually on one side of ManyToMany
        name: 'book_authors', // name of the junction table
        joinColumn: { name: 'bookId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'authorId', referencedColumnName: 'id' },
    })
    authors!: Author[];

    @OneToMany(() => Review, review => review.book)
    reviews!: Review[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}