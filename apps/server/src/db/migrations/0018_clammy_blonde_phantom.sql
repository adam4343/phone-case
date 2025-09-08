DROP TABLE `status`;--> statement-breakpoint
ALTER TABLE `order` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `order` DROP COLUMN `status_id`;