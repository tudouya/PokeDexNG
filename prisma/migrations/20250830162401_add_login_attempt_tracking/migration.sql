-- AlterTable
ALTER TABLE `users` ADD COLUMN `failed_attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `locked_until` DATETIME(3) NULL;
