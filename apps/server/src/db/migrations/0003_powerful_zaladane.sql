DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `account` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `account` ALTER COLUMN "updatedAt" TO "updatedAt" text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "updatedAt" TO "updatedAt" text NOT NULL;--> statement-breakpoint
ALTER TABLE `verification` ALTER COLUMN "createdAt" TO "createdAt" text NOT NULL;--> statement-breakpoint
ALTER TABLE `verification` ALTER COLUMN "updatedAt" TO "updatedAt" text NOT NULL;