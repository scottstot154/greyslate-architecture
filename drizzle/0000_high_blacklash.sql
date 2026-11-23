CREATE TABLE `projects` (
	`slug` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`published` integer NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL
);
