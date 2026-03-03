ALTER TABLE `quests` ADD COLUMN `player_id` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `streaks` ADD COLUMN `player_id` text NOT NULL DEFAULT '';
