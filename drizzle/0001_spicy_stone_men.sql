CREATE TABLE `ideas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`programDescription` text NOT NULL,
	`idea` text NOT NULL,
	`objective` text NOT NULL,
	`justifications` text NOT NULL,
	`features` text NOT NULL,
	`strengths` text NOT NULL,
	`outputs` text NOT NULL,
	`expectedResults` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` varchar(20) NOT NULL DEFAULT 'user';