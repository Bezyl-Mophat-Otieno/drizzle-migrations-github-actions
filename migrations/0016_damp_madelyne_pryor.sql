ALTER TYPE "public"."scankonnect_plan_status" RENAME TO "ptl_scankonnect_plan_status";--> statement-breakpoint
ALTER TYPE "public"."scankonnect_status" RENAME TO "ptl_scankonnect_status";--> statement-breakpoint
ALTER TABLE "scankonnect_feedback_ratings" RENAME TO "ptl_tescankonnect_feedback_ratings";--> statement-breakpoint
ALTER TABLE "scankonnect_files" RENAME TO "ptl_scankonnect_files";--> statement-breakpoint
ALTER TABLE "scankonnect_plans" RENAME TO "ptl_scankonnect_plans";--> statement-breakpoint
ALTER TABLE "scankonnect_qrcodes" RENAME TO "ptl_scankonnect_qrcodes";--> statement-breakpoint
ALTER TABLE "ptl_tescankonnect_feedback_ratings" DROP CONSTRAINT "scankonnect_feedback_ratings_scan_konnect_qrcode_id_scankonnect_qrcodes_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_scankonnect_files" DROP CONSTRAINT "scankonnect_files_scan_konnect_qrcode_id_scankonnect_qrcodes_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_scankonnect_qrcodes" DROP CONSTRAINT "scankonnect_qrcodes_user_id_ptl_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_scankonnect_qrcodes" DROP CONSTRAINT "scankonnect_qrcodes_plan_id_scankonnect_plans_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_tescankonnect_feedback_ratings" ADD CONSTRAINT "ptl_tescankonnect_feedback_ratings_scan_konnect_qrcode_id_ptl_scankonnect_qrcodes_id_fk" FOREIGN KEY ("scan_konnect_qrcode_id") REFERENCES "public"."ptl_scankonnect_qrcodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_scankonnect_files" ADD CONSTRAINT "ptl_scankonnect_files_scan_konnect_qrcode_id_ptl_scankonnect_qrcodes_id_fk" FOREIGN KEY ("scan_konnect_qrcode_id") REFERENCES "public"."ptl_scankonnect_qrcodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_scankonnect_qrcodes" ADD CONSTRAINT "ptl_scankonnect_qrcodes_user_id_ptl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ptl_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_scankonnect_qrcodes" ADD CONSTRAINT "ptl_scankonnect_qrcodes_plan_id_ptl_scankonnect_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."ptl_scankonnect_plans"("id") ON DELETE restrict ON UPDATE no action;