CREATE TABLE `sustainability_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ideaId` int NOT NULL,
	`overallScore` int NOT NULL,
	`indicators` text,
	`recommendations` text,
	`longTermPlan` text,
	`risks` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sustainability_analysis_id` PRIMARY KEY(`id`)
);
