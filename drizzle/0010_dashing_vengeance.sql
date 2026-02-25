ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `loginMethod` varchar(64) NOT NULL DEFAULT 'internal';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `status` varchar(20) NOT NULL DEFAULT 'approved';--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);