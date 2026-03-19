-- Migration: Add new work order statuses for completion review workflow
-- Date: 2026-03-19
-- Description: Update work_orders table enum to include submitted_for_review and rework_requested statuses

USE dev;

-- Update work_orders table enum to include new statuses
ALTER TABLE `work_orders` 
MODIFY COLUMN `status` enum('pending','approved','in_progress','submitted_for_review','completed','rework_requested','rejected','cancelled') DEFAULT 'pending';

-- Verify the change
SHOW CREATE TABLE `work_orders`;
