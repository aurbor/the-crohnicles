CREATE TABLE `activity_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`occurred_at` text NOT NULL,
	`type` text NOT NULL,
	`distance_miles` real NOT NULL,
	`calories_burned` real NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `settings` ADD `suggested_calories` integer;--> statement-breakpoint
ALTER TABLE `settings` ADD `bmr` integer;