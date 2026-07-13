CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`quest_count_at_build` integer DEFAULT 0 NOT NULL,
	`rejected_names` text DEFAULT '[]' NOT NULL,
	`divination_date` text,
	`divination_count` integer DEFAULT 0 NOT NULL,
	`skill_claimed` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `quests` ADD `skill_hint` text;
