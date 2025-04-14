import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationName1744609778309 implements MigrationInterface {
    name = 'MigrationName1744609778309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`authors\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(150) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`books\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(200) NOT NULL, \`isbn\` varchar(20) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_54337dc30d9bb2c3fadebc6909\` (\`isbn\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reviews\` (\`id\` varchar(36) NOT NULL, \`rating\` int NOT NULL, \`comment\` text NULL, \`userId\` varchar(255) NOT NULL, \`bookId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`email\` varchar(100) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('USER', 'ADMIN') NOT NULL DEFAULT 'USER', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`book_authors\` (\`bookId\` varchar(36) NOT NULL, \`authorId\` varchar(36) NOT NULL, INDEX \`IDX_8433d38595493ad358f0cb0a58\` (\`bookId\`), INDEX \`IDX_7afd39332b56e49bdfdf8046ef\` (\`authorId\`), PRIMARY KEY (\`bookId\`, \`authorId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_7ed5659e7139fc8bc039198cc1f\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_cab4e55252a9c18a27e81415299\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`book_authors\` ADD CONSTRAINT \`FK_8433d38595493ad358f0cb0a581\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`book_authors\` ADD CONSTRAINT \`FK_7afd39332b56e49bdfdf8046ef2\` FOREIGN KEY (\`authorId\`) REFERENCES \`authors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`book_authors\` DROP FOREIGN KEY \`FK_7afd39332b56e49bdfdf8046ef2\``);
        await queryRunner.query(`ALTER TABLE \`book_authors\` DROP FOREIGN KEY \`FK_8433d38595493ad358f0cb0a581\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_cab4e55252a9c18a27e81415299\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_7ed5659e7139fc8bc039198cc1f\``);
        await queryRunner.query(`DROP INDEX \`IDX_7afd39332b56e49bdfdf8046ef\` ON \`book_authors\``);
        await queryRunner.query(`DROP INDEX \`IDX_8433d38595493ad358f0cb0a58\` ON \`book_authors\``);
        await queryRunner.query(`DROP TABLE \`book_authors\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`reviews\``);
        await queryRunner.query(`DROP INDEX \`IDX_54337dc30d9bb2c3fadebc6909\` ON \`books\``);
        await queryRunner.query(`DROP TABLE \`books\``);
        await queryRunner.query(`DROP TABLE \`authors\``);
    }

}
