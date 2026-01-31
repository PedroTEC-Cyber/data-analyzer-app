CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`file_id` int NOT NULL,
	`analysis_type` varchar(50) NOT NULL,
	`analysis_name` varchar(255) NOT NULL,
	`analysis_data` text NOT NULL,
	`insights` text,
	`anomalies` text,
	`recommendations` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `statistics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysis_id` int NOT NULL,
	`column_name` varchar(255) NOT NULL,
	`column_type` varchar(50) NOT NULL,
	`mean` text,
	`median` text,
	`std_dev` text,
	`min` text,
	`max` text,
	`count` int,
	`null_count` int,
	`unique_count` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `statistics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploaded_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_key` varchar(512) NOT NULL,
	`file_size` int NOT NULL,
	`file_type` varchar(50) NOT NULL,
	`row_count` int NOT NULL,
	`column_count` int NOT NULL,
	`column_names` text NOT NULL,
	`column_types` text NOT NULL,
	`uploaded_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uploaded_files_id` PRIMARY KEY(`id`)
);
