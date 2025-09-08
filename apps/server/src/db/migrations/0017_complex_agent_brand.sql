CREATE TABLE `shippingAddress` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`street` text NOT NULL,
	`city` text NOT NULL,
	`postalCode` text NOT NULL,
	`country` text NOT NULL,
	`phone` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`price` integer NOT NULL,
	`is_paid` integer DEFAULT false NOT NULL,
	`phone-case_id` text,
	`user_id` text,
	`status_id` text,
	`shipping_id` text,
	`billing_id` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`phone-case_id`) REFERENCES `phone_case`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`status_id`) REFERENCES `status`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shipping_id`) REFERENCES `shippingAddress`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`billing_id`) REFERENCES `shippingAddress`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `status` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `status_name_unique` ON `status` (`name`);