import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Book } from './Book';

@Entity('authors')
export class Author {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 150 })
    name!: string;

    // Add other author details like bio, birthdate if needed
    // @Column({ type: 'text', nullable: true })
    // bio?: string;

    @ManyToMany(() => Book, book => book.authors)
    books!: Book[]; // Relationship managed by Book entity's @JoinTable

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}