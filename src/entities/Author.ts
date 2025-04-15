import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Book } from './Book';

@Entity('authors')
export class Author {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 150 })
    name!: string;

    @ManyToMany(() => Book, book => book.authors)
    books!: Book[]; // Relationship managed by Book entity's @JoinTable

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}