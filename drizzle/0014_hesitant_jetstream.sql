CREATE TABLE `budget_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectTrackingId` int NOT NULL,
	`category` varchar(255) NOT NULL,
	`description` text,
	`plannedAmount` int NOT NULL DEFAULT 0,
	`actualAmount` int NOT NULL DEFAULT 0,
	`spentDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kpi_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectTrackingId` int NOT NULL,
	`kpiName` varchar(255) NOT NULL,
	`targetValue` varchar(100) NOT NULL,
	`actualValue` varchar(100),
	`unit` varchar(100),
	`measurementDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `kpi_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectTrackingId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`priority` varchar(20) NOT NULL DEFAULT 'medium',
	`assignee` varchar(255),
	`dueDate` timestamp,
	`completedAt` timestamp,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ideaId` int NOT NULL,
	`userId` int NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'planning',
	`overallProgress` int NOT NULL DEFAULT 0,
	`actualStartDate` timestamp,
	`expectedEndDate` timestamp,
	`actualEndDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `risk_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectTrackingId` int NOT NULL,
	`riskDescription` text NOT NULL,
	`severity` varchar(20) NOT NULL DEFAULT 'medium',
	`likelihood` varchar(20) NOT NULL DEFAULT 'medium',
	`status` varchar(50) NOT NULL DEFAULT 'identified',
	`mitigationStrategy` text,
	`owner` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `risk_tracking_id` PRIMARY KEY(`id`)
);
