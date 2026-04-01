-- Migration: Add work_order_assignees junction table for multiple assignees support
-- Date: 2026-04-01
-- Description: Create work_order_assignees table to support assigning multiple users to one work order

USE dev;

-- Create junction table for work order assignees (many-to-many relationship)
CREATE TABLE IF NOT EXISTS `work_order_assignees` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `work_order_id` int NOT NULL,
  `assigned_to_user_id` int NOT NULL,
  `assigned_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_work_order_user` (`work_order_id`, `assigned_to_user_id`),
  FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  KEY `idx_user_id` (`assigned_to_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add column to track if primary assignee exists (for backward compatibility)
-- Keep assigned_to for backward compat reads, but populate from work_order_assignees
-- New writes should use work_order_assignees table

-- Migrate existing data: copy assignedTo to work_order_assignees if not null
INSERT IGNORE INTO `work_order_assignees` (`work_order_id`, `assigned_to_user_id`)
SELECT `id`, `assigned_to` FROM `work_orders` WHERE `assigned_to` IS NOT NULL;

-- Verify the table
SHOW CREATE TABLE `work_order_assignees`;
SELECT COUNT(*) as total_assignees FROM `work_order_assignees`;
