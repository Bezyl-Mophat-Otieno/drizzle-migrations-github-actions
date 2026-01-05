CREATE TYPE "public"."ptl_settings_category" AS ENUM('general', 'security', 'notifications');--> statement-breakpoint
ALTER TABLE "ptl_settings" ALTER COLUMN "category" SET DATA TYPE ptl_settings_category USING category::ptl_settings_category;--> statement-breakpoint
ALTER TABLE "ptl_settings" ALTER COLUMN "category" SET DEFAULT 'general';