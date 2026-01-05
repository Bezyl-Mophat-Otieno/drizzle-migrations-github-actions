-- First, drop the old enum-dependent column
ALTER TABLE "ptl_products" DROP COLUMN "unit_of_measurement";--> statement-breakpoint
ALTER TABLE "ptl_products" DROP COLUMN "country_of_issue";--> statement-breakpoint

-- Then, (optionally) drop old enum types if they exist
DROP TYPE IF EXISTS "unit_of_measurement";--> statement-breakpoint
DROP TYPE IF EXISTS "country_of_issue";--> statement-breakpoint

-- Now recreate the enum types
CREATE TYPE "public"."country_of_issue" AS ENUM(
  'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'Ethiopia', 'South Sudan', 'Somalia', 'Djibouti'
);--> statement-breakpoint

CREATE TYPE "public"."unit_of_measurement" AS ENUM(
  'kg', 'g', 'mg', 'lb', 'oz', 'l', 'ml', 'gal', 'qt', 'pt',
  'm', 'cm', 'mm', 'ft', 'in', 'pcs', 'units', 'boxes', 'packs'
);--> statement-breakpoint

-- Re-add the columns with the new enum types and defaults
ALTER TABLE "ptl_products" ADD COLUMN "unit_of_measurement" unit_of_measurement NOT NULL DEFAULT 'kg';--> statement-breakpoint
ALTER TABLE "ptl_products" ADD COLUMN "country_of_issue" country_of_issue NOT NULL DEFAULT 'Kenya';--> statement-breakpoint
ALTER TABLE "ptl_barcodes" ADD COLUMN "barcode_image_url" text;--> statement-breakpoint
