-- Seed data for the Book Review System API (MySQL)
-- Ensure you have run migrations first to create the tables.
-- IMPORTANT: Replace the placeholder password hash below with a real bcrypt hash for 'password123'.

START TRANSACTION;

-- ============================================================================
--  Users
-- ============================================================================
-- Default password for both users is 'password123'
-- ** REPLACE THIS HASH with a real hash generated for 'password123' **
-- Example hash generated with bcrypt (cost 10): $2b$10$Kousj4SxEiT.OG4.V3o1quh6zKuLLUJET4a0p977mfgDELvoPNqZO
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
('1ab2c3d4-e5f6-7890-1234-567890abcdef', 'Alice Wonderland', 'alice@example.com', '$2b$10$Kousj4SxEiT.OG4.V3o1quh6zKuLLUJET4a0p977mfgDELvoPNqZO', 'USER', NOW(), NOW()),
('2ab2c3d4-e5f6-7890-1234-567890abcdef', 'Bob The Admin', 'bob.admin@example.com', '$2b$10$Kousj4SxEiT.OG4.V3o1quh6zKuLLUJET4a0p977mfgDELvoPNqZO', 'ADMIN', NOW(), NOW());

-- ============================================================================
--  Authors
-- ============================================================================
INSERT INTO `authors` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
('12bee52d-ebb8-49be-a1f5-c1f788816b56', 'J.R.R. Tolkien', NOW(), NOW()),
('4617884c-48a0-47c7-a301-f4d79666550a', 'George Orwell', NOW(), NOW()),
('fa6915f7-34b6-40ae-806b-eaf8f5563fd4', 'J.K. Rowling', NOW(), NOW()),
('a8b4bfae-6846-405a-b132-617c2ed566a7', 'Jane Austen', NOW(), NOW());

-- ============================================================================
--  Books
-- ============================================================================
INSERT INTO `books` (`id`, `title`, `isbn`, `createdAt`, `updatedAt`) VALUES
('40f250ac-5fbb-4683-8bb0-83374e52693f', 'The Hobbit', '978-0547928227', NOW(), NOW()),
('e5305898-dc98-4284-bce8-b87d4ad5ca55', 'Nineteen Eighty-Four', '978-0451524935', NOW(), NOW()),
('e5a0bb40-e2cf-4f45-8dda-b4630c4d044d', 'Harry Potter and the Sorcerer\'s Stone', '978-0590353427', NOW(), NOW()),
('bb59c5cc-6a74-4754-9f85-6b71a7a56c4e', 'The Lord of the Rings', '978-0618260274', NOW(), NOW()),
('754b13f1-7ea9-4329-8ed9-4309eb7fa19d', 'Pride and Prejudice', '978-0141439518', NOW(), NOW());

-- ============================================================================
--  Book Authors (Junction Table for ManyToMany relationship)
-- ============================================================================
INSERT INTO `book_authors` (`bookId`, `authorId`) VALUES
('40f250ac-5fbb-4683-8bb0-83374e52693f', '12bee52d-ebb8-49be-a1f5-c1f788816b56'), -- Hobbit -> Tolkien
('bb59c5cc-6a74-4754-9f85-6b71a7a56c4e', '12bee52d-ebb8-49be-a1f5-c1f788816b56'), -- LotR -> Tolkien
('e5305898-dc98-4284-bce8-b87d4ad5ca55', '4617884c-48a0-47c7-a301-f4d79666550a'), -- 1984 -> Orwell
('e5a0bb40-e2cf-4f45-8dda-b4630c4d044d', 'fa6915f7-34b6-40ae-806b-eaf8f5563fd4'), -- HP1 -> Rowling
('754b13f1-7ea9-4329-8ed9-4309eb7fa19d', 'a8b4bfae-6846-405a-b132-617c2ed566a7'); -- Pride -> Austen

-- ============================================================================
--  Reviews
-- ============================================================================
INSERT INTO `reviews` (`id`, `rating`, `comment`, `userId`, `bookId`, `createdAt`, `updatedAt`) VALUES
('2fc0b106-c12d-4a87-b257-b389121c6384', 5, 'An absolute classic adventure! Read it multiple times.', '1ab2c3d4-e5f6-7890-1234-567890abcdef', '40f250ac-5fbb-4683-8bb0-83374e52693f', NOW(), NOW()), -- Alice reviews Hobbit
('a14f91b2-febf-4073-8f23-d43f06ff9fd4', 4, 'A chilling and important read, though quite bleak.', '1ab2c3d4-e5f6-7890-1234-567890abcdef', 'e5305898-dc98-4284-bce8-b87d4ad5ca55', NOW(), NOW()), -- Alice reviews 1984
('197c173d-5c9a-4993-b037-8df65201f009', 5, 'Magical beginning to a wonderful series. Highly recommend!', '2ab2c3d4-e5f6-7890-1234-567890abcdef', 'e5a0bb40-e2cf-4f45-8dda-b4630c4d044d', NOW(), NOW()), -- Bob reviews HP1
('52af5852-a1a7-4b85-b6f1-ff2205a37c00', 4, NULL, '2ab2c3d4-e5f6-7890-1234-567890abcdef', '754b13f1-7ea9-4329-8ed9-4309eb7fa19d', NOW(), NOW()), -- Bob reviews Pride (no comment)
('25d5b13c-30ef-4d01-83d2-b98a58d94609', 5, 'Truly epic in scope.', '1ab2c3d4-e5f6-7890-1234-567890abcdef', 'bb59c5cc-6a74-4754-9f85-6b71a7a56c4e', NOW(), NOW()); -- Alice reviews LotR


-- Commit the transaction
COMMIT;

-- ============================================================================
-- End of Seed Script
-- ============================================================================