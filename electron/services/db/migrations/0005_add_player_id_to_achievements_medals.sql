ALTER TABLE `achievements` ADD COLUMN `player_id` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `medals` ADD COLUMN `player_id` text NOT NULL DEFAULT '';
