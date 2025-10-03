CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`booking_id` text NOT NULL,
	`customer_id` text NOT NULL,
	`parking_space_id` integer NOT NULL,
	`customer_name` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`duration` text NOT NULL,
	`amount` integer NOT NULL,
	`status` text DEFAULT 'pending',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parking_space_id`) REFERENCES `parking_spaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_booking_id_unique` ON `bookings` (`booking_id`);--> statement-breakpoint
CREATE TABLE `parking_spaces` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`city` text NOT NULL,
	`address` text,
	`total_spots` integer NOT NULL,
	`available_spots` integer NOT NULL,
	`price` integer NOT NULL,
	`price_type` text DEFAULT 'per hour',
	`status` text DEFAULT 'active',
	`features` text,
	`description` text,
	`monthly_revenue` integer DEFAULT 0,
	`total_bookings` integer DEFAULT 0,
	`rating` real DEFAULT 0,
	`image_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
