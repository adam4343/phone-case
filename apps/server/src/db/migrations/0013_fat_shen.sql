PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_phone_case` (
	`id` text PRIMARY KEY NOT NULL,
	`price` integer NOT NULL,
	`image` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`croppedImage` text NOT NULL,
	`user_id` text,
	`model_id` text NOT NULL,
	`material_id` text NOT NULL,
	`color_id` text,
	`createdAt` text NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_id`) REFERENCES `model`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`material_id`) REFERENCES `material`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`color_id`) REFERENCES `color`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_phone_case`("id", "price", "image", "width", "height", "croppedImage", "user_id", "model_id", "material_id", "color_id", "createdAt", "updatedAt") SELECT "id", "price", "image", "width", "height", "croppedImage", "user_id", "model_id", "material_id", "color_id", "createdAt", "updatedAt" FROM `phone_case`;--> statement-breakpoint
DROP TABLE `phone_case`;--> statement-breakpoint
ALTER TABLE `__new_phone_case` RENAME TO `phone_case`;--> statement-breakpoint
PRAGMA foreign_keys=ON;