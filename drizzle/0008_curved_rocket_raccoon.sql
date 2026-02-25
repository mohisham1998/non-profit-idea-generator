CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`canGenerateIdea` int NOT NULL DEFAULT 1,
	`canGenerateKPIs` int NOT NULL DEFAULT 1,
	`canEstimateBudget` int NOT NULL DEFAULT 1,
	`canGenerateSWOT` int NOT NULL DEFAULT 1,
	`canGenerateLogFrame` int NOT NULL DEFAULT 1,
	`canGeneratePMDPro` int NOT NULL DEFAULT 1,
	`canGenerateDesignThinking` int NOT NULL DEFAULT 1,
	`canChat` int NOT NULL DEFAULT 1,
	`canExportPDF` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
);
