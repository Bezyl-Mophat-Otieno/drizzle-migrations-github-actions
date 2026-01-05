ALTER TYPE "public"."invoice_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "adminNotes" text;