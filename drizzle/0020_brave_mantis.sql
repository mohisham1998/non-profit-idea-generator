CREATE TABLE `researchStudies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ideaId` int NOT NULL,
	`userId` int NOT NULL,
	`executiveSummary` text,
	`programImportance` text,
	`socialReturn` text,
	`organizationReturn` text,
	`recommendations` text,
	`references` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `researchStudies_id` PRIMARY KEY(`id`)
);
