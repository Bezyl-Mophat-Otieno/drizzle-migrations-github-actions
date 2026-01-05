CREATE TYPE "public"."uln_type" AS ENUM('UPI7', 'UPI11', 'UPI13');--> statement-breakpoint
CREATE TABLE "ptl_uln_prefixes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prefix" varchar(12) NOT NULL,
	"type" "uln_type" NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"max_companies" integer NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"next_sequence_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ptl_companies" ADD COLUMN "uln_number" varchar(15);--> statement-breakpoint
ALTER TABLE "ptl_companies" ADD COLUMN "uln_prefix_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_uln_prefix_idx" ON "ptl_uln_prefixes" USING btree ("is_active") WHERE "ptl_uln_prefixes"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_uln_prefix_idx" ON "ptl_uln_prefixes" USING btree ("prefix");--> statement-breakpoint
ALTER TABLE "ptl_companies" ADD CONSTRAINT "ptl_companies_uln_prefix_id_ptl_uln_prefixes_id_fk" FOREIGN KEY ("uln_prefix_id") REFERENCES "public"."ptl_uln_prefixes"("id") ON DELETE no action ON UPDATE no action;