ALTER TABLE "ptl_scankonnect_plans" ALTER COLUMN "amount" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ptl_scankonnect_plans" ADD COLUMN "maxFiles" integer DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_scankonnect_plans" ADD COLUMN "maxFileSize" integer DEFAULT 20 NOT NULL;