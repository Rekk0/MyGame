CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL DEFAULT '',
	`name` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`level` integer NOT NULL DEFAULT 1,
	`xp` integer NOT NULL DEFAULT 0,
	`max_xp` integer NOT NULL DEFAULT 100,
	`traits` text NOT NULL DEFAULT '[]',
	`parent_skill_id` text,
	`is_unlocked` integer NOT NULL DEFAULT 0
);
