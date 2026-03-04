CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`tier` text NOT NULL,
	`trigger_condition` text NOT NULL,
	`unlock_text` text,
	`unlocked_at` text,
	`is_unlocked` integer DEFAULT 0 NOT NULL
);
