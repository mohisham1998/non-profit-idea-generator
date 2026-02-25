ALTER TABLE `users` MODIFY COLUMN `status` varchar(20) NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `users` ADD `associationName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);