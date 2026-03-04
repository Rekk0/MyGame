CREATE TABLE `medals` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`svg_code` text NOT NULL,
	`seed` text NOT NULL,
	`description` text NOT NULL,
	`unlocked_at` text NOT NULL
);
