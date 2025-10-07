ALTER TABLE `bookings` ADD `payment_screenshot` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `payment_status` text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `bookings` ADD `verification_reason` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `transaction_id` text;