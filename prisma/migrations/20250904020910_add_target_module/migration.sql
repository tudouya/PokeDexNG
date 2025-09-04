-- CreateTable
CREATE TABLE `targets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `project_name` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` ENUM('WEB_APPLICATION', 'API', 'SERVER', 'NETWORK', 'MOBILE_APP', 'WECHAT_APP', 'DATABASE', 'OTHER') NOT NULL DEFAULT 'WEB_APPLICATION',
    `url` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `deployment_env` VARCHAR(50) NULL DEFAULT 'PROD',
    `network_zone` VARCHAR(50) NULL DEFAULT 'INTERNET',
    `scope` TEXT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD') NOT NULL DEFAULT 'PENDING',
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    `remark` TEXT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `targets_project_name_is_deleted_idx`(`project_name`, `is_deleted`),
    INDEX `idx_targets_deployment_env`(`deployment_env`),
    INDEX `idx_targets_network_zone`(`network_zone`),
    INDEX `idx_targets_type`(`type`),
    INDEX `idx_targets_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
