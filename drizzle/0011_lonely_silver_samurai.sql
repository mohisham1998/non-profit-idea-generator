CREATE TABLE `system_features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`featureKey` varchar(100) NOT NULL,
	`nameAr` varchar(255) NOT NULL,
	`description` text,
	`isEnabled` int NOT NULL DEFAULT 1,
	`category` varchar(100) NOT NULL DEFAULT 'general',
	`icon` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_features_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_features_featureKey_unique` UNIQUE(`featureKey`)
);
