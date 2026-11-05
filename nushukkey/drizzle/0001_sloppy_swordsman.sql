CREATE TABLE `nushukKeys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`normalizedKey` varchar(160) NOT NULL,
	`publicRef` varchar(18) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `nushukKeys_id` PRIMARY KEY(`id`),
	CONSTRAINT `nushukKeys_publicRef_unique` UNIQUE(`publicRef`),
	CONSTRAINT `nushukKeys_normalizedKey_unique` UNIQUE(`normalizedKey`)
);
