USE dev;

ALTER TABLE `work_orders`
  ADD COLUMN `rejection_reason` text NULL AFTER `approved_by`;
