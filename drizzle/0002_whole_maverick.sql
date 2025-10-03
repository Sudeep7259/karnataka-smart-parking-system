ALTER TABLE `bookings` ADD `cancellation_reason` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `modified_at` text;--> statement-breakpoint
ALTER TABLE `parking_spaces` ADD `peak_hours` text;--> statement-breakpoint
ALTER TABLE `parking_spaces` ADD `peak_price` integer;--> statement-breakpoint
ALTER TABLE `parking_spaces` ADD `off_peak_price` integer;--> statement-breakpoint
ALTER TABLE `parking_spaces` ADD `latitude` real;--> statement-breakpoint
ALTER TABLE `parking_spaces` ADD `longitude` real;