ALTER TYPE "public"."ptl_subscription_status" ADD VALUE 'inactive';--> statement-breakpoint
ALTER TABLE "ptl_barcodes" ALTER COLUMN "upi_prefix_id" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_company_plan_status" ON "ptl_subscriptions" USING btree ("company_id","plan_id","status");