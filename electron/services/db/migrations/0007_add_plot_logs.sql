CREATE TABLE `plot_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL DEFAULT '',
	`type` text NOT NULL,
	`period_key` text NOT NULL,
	`summary` text NOT NULL,
	`created_at` text NOT NULL
);
