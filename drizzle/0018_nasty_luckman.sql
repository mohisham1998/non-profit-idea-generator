ALTER TABLE `ideas` ADD `isApproved` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `ideas` ADD `approvedAt` timestamp;--> statement-breakpoint
ALTER TABLE `ideas` ADD `approvedBy` int;