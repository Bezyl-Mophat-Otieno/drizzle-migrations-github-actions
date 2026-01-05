CREATE TYPE "public"."scankonnect_cadence" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."scankonnect_plan_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."scankonnect_status" AS ENUM('active', 'expired', 'suspended', 'deleted');--> statement-breakpoint
CREATE TABLE "scankonnect_feedback_ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_konnect_qrcode_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone_number" varchar(20),
	"feedback_text" text,
	"rating" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scankonnect_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_konnect_qrcode_id" uuid NOT NULL,
	"file_url" varchar NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" bigint NOT NULL,
	"type" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "scankonnect_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"cadence" "scankonnect_cadence" NOT NULL,
	"status" "scankonnect_plan_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scankonnect_qrcodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"qr_code_url" varchar,
	"social_media_links" jsonb,
	"video_urls" jsonb,
	"enable_feedback_rating" boolean DEFAULT false NOT NULL,
	"files_required" boolean DEFAULT true NOT NULL,
	"expires_on" timestamp with time zone NOT NULL,
	"status" "scankonnect_status" DEFAULT 'active' NOT NULL,
	"scans" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scankonnect_feedback_ratings" ADD CONSTRAINT "scankonnect_feedback_ratings_scan_konnect_qrcode_id_scankonnect_qrcodes_id_fk" FOREIGN KEY ("scan_konnect_qrcode_id") REFERENCES "public"."scankonnect_qrcodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scankonnect_files" ADD CONSTRAINT "scankonnect_files_scan_konnect_qrcode_id_scankonnect_qrcodes_id_fk" FOREIGN KEY ("scan_konnect_qrcode_id") REFERENCES "public"."scankonnect_qrcodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scankonnect_qrcodes" ADD CONSTRAINT "scankonnect_qrcodes_user_id_ptl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ptl_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scankonnect_qrcodes" ADD CONSTRAINT "scankonnect_qrcodes_plan_id_scankonnect_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."scankonnect_plans"("id") ON DELETE restrict ON UPDATE no action;