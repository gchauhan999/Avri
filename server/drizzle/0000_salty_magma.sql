CREATE TABLE `admin_users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('super_admin','editor') NOT NULL DEFAULT 'editor',
	`is_active` boolean NOT NULL DEFAULT true,
	`must_change_password` boolean NOT NULL DEFAULT false,
	`token_version` int unsigned NOT NULL DEFAULT 0,
	`last_login_at` datetime,
	`failed_attempts` smallint unsigned NOT NULL DEFAULT 0,
	`locked_until` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_admin_users_email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`job_id` bigint unsigned,
	`job_title_snapshot` varchar(200) NOT NULL,
	`full_name` varchar(160) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`phone_normalised` char(10) NOT NULL,
	`current_location` varchar(160),
	`experience_years` decimal(4,1),
	`current_company` varchar(160),
	`notice_period` varchar(60),
	`linkedin_url` varchar(300),
	`cover_letter` text,
	`resume_path` varchar(400) NOT NULL,
	`resume_original_name` varchar(255) NOT NULL,
	`resume_mime` varchar(120) NOT NULL,
	`resume_size_bytes` int unsigned NOT NULL,
	`resume_sha256` char(64) NOT NULL,
	`status` enum('new','shortlisted','interviewing','rejected','hired') NOT NULL DEFAULT 'new',
	`admin_notes` text,
	`email_status` enum('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending',
	`email_error` varchar(500),
	`email_attempts` tinyint unsigned NOT NULL DEFAULT 0,
	`source_ip` varbinary(16),
	`user_agent` varchar(400),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`logo_path` varchar(400),
	`logo_width` smallint unsigned,
	`logo_height` smallint unsigned,
	`website_url` varchar(300),
	`sector` varchar(120),
	`is_authorized` boolean NOT NULL DEFAULT false,
	`authorization_note` varchar(400),
	`authorized_at` datetime,
	`authorized_by` bigint unsigned,
	`is_published` boolean NOT NULL DEFAULT false,
	`sort_order` smallint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_clients_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`kind` enum('enquiry','quote_request') NOT NULL,
	`name` varchar(160) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`phone_normalised` char(10) NOT NULL,
	`email` varchar(255),
	`company` varchar(180),
	`subject` varchar(200),
	`service` varchar(160),
	`industry` varchar(160),
	`product` varchar(200),
	`location` varchar(200),
	`capacity` varchar(120),
	`budget` varchar(120),
	`timeline` varchar(120),
	`message` text NOT NULL,
	`status` enum('new','contacted','quoted','won','lost','spam') NOT NULL DEFAULT 'new',
	`admin_notes` text,
	`email_status` enum('pending','sent','failed','skipped') NOT NULL DEFAULT 'pending',
	`email_error` varchar(500),
	`email_attempts` tinyint unsigned NOT NULL DEFAULT 0,
	`source_page` varchar(300),
	`source_ip` varbinary(16),
	`user_agent` varchar(400),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(220) NOT NULL,
	`department` varchar(120),
	`location` varchar(160) NOT NULL,
	`employment_type` enum('full_time','part_time','contract','internship') NOT NULL DEFAULT 'full_time',
	`experience_min` tinyint unsigned,
	`experience_max` tinyint unsigned,
	`openings` smallint unsigned NOT NULL DEFAULT 1,
	`salary_range` varchar(120),
	`salary_min` int unsigned,
	`salary_max` int unsigned,
	`salary_period` enum('month','year') DEFAULT 'month',
	`summary` varchar(500) NOT NULL,
	`description` mediumtext NOT NULL,
	`responsibilities` json,
	`requirements` json,
	`status` enum('draft','open','closed') NOT NULL DEFAULT 'draft',
	`published_at` datetime,
	`closes_at` date,
	`seo_title` varchar(200),
	`seo_description` varchar(320),
	`created_by` bigint unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_jobs_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `post_categories` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`slug` varchar(140) NOT NULL,
	`description` varchar(300),
	`sort_order` smallint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `post_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_post_categories_slug` UNIQUE(`slug`),
	CONSTRAINT `uq_post_categories_name` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`title` varchar(220) NOT NULL,
	`slug` varchar(240) NOT NULL,
	`category_id` bigint unsigned NOT NULL,
	`excerpt` varchar(400),
	`body` mediumtext NOT NULL,
	`cover_image_path` varchar(400),
	`cover_image_alt` varchar(255),
	`cover_image_width` smallint unsigned,
	`cover_image_height` smallint unsigned,
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`published_at` datetime,
	`reading_minutes` tinyint unsigned,
	`is_featured` boolean NOT NULL DEFAULT false,
	`seo_title` varchar(200),
	`seo_description` varchar(320),
	`seo_keywords` varchar(400),
	`canonical_url` varchar(400),
	`author_id` bigint unsigned,
	`author_name_snapshot` varchar(160),
	`view_count` int unsigned NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_posts_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_job_id_jobs_id_fk` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_authorized_by_admin_users_id_fk` FOREIGN KEY (`authorized_by`) REFERENCES `admin_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_created_by_admin_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_category_id_post_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `post_categories`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_author_id_admin_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `admin_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_applications_job_created` ON `applications` (`job_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_applications_status` ON `applications` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_applications_email` ON `applications` (`email`);--> statement-breakpoint
CREATE INDEX `idx_applications_dedupe` ON `applications` (`job_id`,`resume_sha256`);--> statement-breakpoint
CREATE INDEX `idx_applications_mail` ON `applications` (`email_status`);--> statement-breakpoint
CREATE INDEX `idx_clients_public` ON `clients` (`is_published`,`is_authorized`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_enquiries_kind_created` ON `enquiries` (`kind`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_enquiries_status` ON `enquiries` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_enquiries_phone` ON `enquiries` (`phone_normalised`);--> statement-breakpoint
CREATE INDEX `idx_enquiries_mail` ON `enquiries` (`email_status`);--> statement-breakpoint
CREATE INDEX `idx_jobs_status_published` ON `jobs` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_jobs_department` ON `jobs` (`department`);--> statement-breakpoint
CREATE INDEX `idx_posts_status_published` ON `posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_posts_category_status` ON `posts` (`category_id`,`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_posts_featured` ON `posts` (`is_featured`,`published_at`);