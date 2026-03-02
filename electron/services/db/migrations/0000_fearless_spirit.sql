CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`title` text,
	`level` integer DEFAULT 1 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`gold` integer DEFAULT 0 NOT NULL,
	`ep` integer DEFAULT 100 NOT NULL,
	`max_ep` integer DEFAULT 100 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quests` (
	`id` text PRIMARY KEY NOT NULL,
	`original_text` text NOT NULL,
	`gamified_name` text,
	`narrative` text,
	`xp` integer DEFAULT 10 NOT NULL,
	`type` text DEFAULT 'test' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`due_date` text,
	`completed_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `streaks` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'daily' NOT NULL,
	`current_count` integer DEFAULT 0 NOT NULL,
	`best_count` integer DEFAULT 0 NOT NULL,
	`last_active_date` text NOT NULL
);
