CREATE TABLE "ptl_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_number" varchar(50) NOT NULL,
	"transaction_id" uuid NOT NULL,
	"invoice_id" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"pdf_url" varchar(500),
	"pdf_key" varchar(500),
	"email_sent_at" timestamp,
	"email_sent_to" varchar(255),
	"notes" text,
	"metadata" jsonb,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ptl_receipts_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
ALTER TABLE "ptl_receipts" ADD CONSTRAINT "ptl_receipts_transaction_id_ptl_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."ptl_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_receipts" ADD CONSTRAINT "ptl_receipts_invoice_id_ptl_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ptl_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_receipts" ADD CONSTRAINT "ptl_receipts_deleted_by_ptl_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_scankonnect_files" DROP COLUMN "type";