ALTER TABLE "ptl_invoice_items" RENAME COLUMN "amount" TO "line_total";--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" DROP CONSTRAINT "ptl_invoice_items_invoice_id_ptl_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_invoices" DROP CONSTRAINT "ptl_invoices_subscription_id_ptl_subscriptions_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" ALTER COLUMN "description" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "invoice_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "invoice_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "due_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "status" SET DEFAULT 'unpaid';--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "total_amount" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" ADD COLUMN "quantity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" ADD COLUMN "unit_price" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "invoice_number" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "company_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "service" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "prepared_by" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "subtotal" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "tax" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "pdf_url" varchar(500);--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "pdf_key" varchar(500);--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "generated_at" timestamp;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "email_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "email_sent_to" varchar(255);--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" ADD CONSTRAINT "ptl_invoice_items_invoice_id_ptl_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ptl_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD CONSTRAINT "ptl_invoices_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD CONSTRAINT "ptl_invoices_created_by_ptl_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD CONSTRAINT "ptl_invoices_deleted_by_ptl_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_invoices" DROP COLUMN "subscription_id";--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD CONSTRAINT "ptl_invoices_invoice_number_unique" UNIQUE("invoice_number");