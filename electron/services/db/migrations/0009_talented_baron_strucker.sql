CREATE TABLE `resource_events` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text DEFAULT '' NOT NULL,
	`source` text NOT NULL,
	`quest_id` text,
	`energy_delta` integer DEFAULT 0 NOT NULL,
	`willpower_delta` integer DEFAULT 0 NOT NULL,
	`spirit_delta` integer DEFAULT 0 NOT NULL,
	`e` integer,
	`d` integer,
	`l` integer,
	`created_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `players` ADD `willpower` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `max_willpower` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `spirit` integer DEFAULT 70 NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `max_spirit` integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE `quests` ADD `ai_energy_pct` integer;--> statement-breakpoint
ALTER TABLE `quests` ADD `ai_drive` integer;--> statement-breakpoint
ALTER TABLE `quests` ADD `ai_like` integer;--> statement-breakpoint
ALTER TABLE `quests` ADD `user_energy_pct` integer;--> statement-breakpoint
ALTER TABLE `quests` ADD `user_drive` integer;--> statement-breakpoint
ALTER TABLE `quests` ADD `user_like` integer;