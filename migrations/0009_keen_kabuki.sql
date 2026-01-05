ALTER TABLE "ptl_qr_codes" ADD COLUMN "scan_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_qr_codes" ADD COLUMN "last_scanned_at" timestamp with time zone;