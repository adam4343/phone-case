DROP TABLE `finish`;--> statement-breakpoint
ALTER TABLE `phone_case` ADD `color_id` text NOT NULL REFERENCES color(id);--> statement-breakpoint
ALTER TABLE `phone_case` ALTER COLUMN "model_id" TO "model_id" text NOT NULL REFERENCES model(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `phone_case` ALTER COLUMN "material_id" TO "material_id" text NOT NULL REFERENCES material(id) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `phone_case` DROP COLUMN `finish_id`;