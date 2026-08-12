CREATE TABLE `diary_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`occurred_at` text NOT NULL,
	`item_id` integer NOT NULL,
	`quantity` real DEFAULT 1 NOT NULL,
	`mood` text,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`basis` text NOT NULL,
	`calories` real NOT NULL,
	`protein` real NOT NULL,
	`sugar` real NOT NULL,
	`unit_weight_g` real,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`activity` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `journal_entries_date_unique` ON `journal_entries` (`date`);--> statement-breakpoint
CREATE TABLE `medication_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`occurred_at` text NOT NULL,
	`medication_id` integer NOT NULL,
	`quantity` real NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`medication_id`) REFERENCES `medications`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`form` text NOT NULL,
	`units_per_dose` real NOT NULL,
	`strength` text NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`diet_start_date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `symptom_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`occurred_at` text NOT NULL,
	`bristol_scale` integer,
	`severity` integer,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weight_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`weight_kg` real NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
