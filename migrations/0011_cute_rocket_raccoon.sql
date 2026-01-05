ALTER TABLE "ptl_transactions" ALTER COLUMN "phone_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "method_of_payment" varchar(50) DEFAULT 'mpesa';--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "cheque_number" varchar(100);--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "bank_reference" varchar(100);--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "reconciled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "added_by" varchar(255) DEFAULT 'System';--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "added_by_id" uuid;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "currency" varchar(10) DEFAULT 'KES';--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD CONSTRAINT "ptl_transactions_added_by_id_ptl_users_id_fk" FOREIGN KEY ("added_by_id") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD CONSTRAINT "ptl_transactions_deleted_by_ptl_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;