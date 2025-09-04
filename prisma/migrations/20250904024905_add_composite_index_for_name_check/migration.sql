-- CreateIndex
CREATE INDEX `idx_targets_project_name_active` ON `targets`(`project_name`, `name`, `is_deleted`);
