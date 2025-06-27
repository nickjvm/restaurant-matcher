CREATE TABLE `sessions` (
	`session_id` text PRIMARY KEY,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	`location_name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`filters` numeric,
	`is_active` numeric DEFAULT (TRUE),
	`match_notified` numeric DEFAULT (FALSE),
	CONSTRAINT "votes_check_1" CHECK(vote_type IN ('like', 'dislike')
);

CREATE TABLE `matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`session_id` text NOT NULL,
	`business_id` text NOT NULL,
	`matched_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`session_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "votes_check_1" CHECK(vote_type IN ('like', 'dislike')
);

CREATE INDEX `idx_matches_session` ON `matches` (`session_id`);

CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`joined_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	CONSTRAINT "votes_check_1" CHECK(vote_type IN ('like', 'dislike')
);

CREATE TABLE `session_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` text NOT NULL,
	`session_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`session_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "votes_check_1" CHECK(vote_type IN ('like', 'dislike')
);

CREATE TABLE `votes` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`user_id` text NOT NULL,
	`session_id` text NOT NULL,
	`business_id` text NOT NULL,
	`vote_type` text NOT NULL,
	`voted_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`session_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "votes_check_1" CHECK(vote_type IN ('like', 'dislike')
);