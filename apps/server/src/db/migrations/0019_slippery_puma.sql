ALTER TABLE `order` ADD `stripe-session_id` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `order_stripe-session_id_unique` ON `order` (`stripe-session_id`);