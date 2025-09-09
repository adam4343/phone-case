CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`password` text,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `color` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`hex` text NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
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
	`status` text DEFAULT 'pending' NOT NULL,
	`stripe-session_id` text NOT NULL,
	`phone-case_id` text,
	`user_id` text,
	`shipping_id` text,
	`billing_id` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`phone-case_id`) REFERENCES `phone_case`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shipping_id`) REFERENCES `shippingAddress`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`billing_id`) REFERENCES `shippingAddress`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_stripe-session_id_unique` ON `order` (`stripe-session_id`);--> statement-breakpoint
CREATE TABLE `material` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `model` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`year` integer NOT NULL,
	`price` integer NOT NULL,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `phone_case` (
	`id` text PRIMARY KEY NOT NULL,
	`price` integer NOT NULL,
	`image` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`croppedImage` text NOT NULL,
	`user_id` text,
	`model_id` text,
	`material_id` text,
	`color_id` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_id`) REFERENCES `model`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`material_id`) REFERENCES `material`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`color_id`) REFERENCES `color`(`id`) ON UPDATE no action ON DELETE no action
);
