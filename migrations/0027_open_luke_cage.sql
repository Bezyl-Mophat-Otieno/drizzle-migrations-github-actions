ALTER TABLE "ptlptl_invoices" RENAME TO "ptl_invoices";--> statement-breakpoint
ALTER TABLE "ptl_invoices" DROP CONSTRAINT "ptlptl_invoices_invoice_number_unique";--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" DROP CONSTRAINT "ptl_invoice_items_invoice_id_ptlptl_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_invoices" DROP CONSTRAINT "ptlptl_invoices_company_id_ptl_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_invoices" DROP CONSTRAINT "ptlptl_invoices_created_by_ptl_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_invoices" DROP CONSTRAINT "ptlptl_invoices_deleted_by_ptl_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_receipts" DROP CONSTRAINT "ptl_receipts_invoice_id_ptlptl_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_transactions" DROP CONSTRAINT "ptl_transactions_invoice_id_ptlptl_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" ADD CONSTRAINT "ptl_invoice_items_invoice_id_ptl_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ptl_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD CONSTRAINT "ptl_invoices_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD CONSTRAINT "ptl_invoices_created_by_ptl_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD CONSTRAINT "ptl_invoices_deleted_by_ptl_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_receipts" ADD CONSTRAINT "ptl_receipts_invoice_id_ptl_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ptl_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD CONSTRAINT "ptl_transactions_invoice_id_ptl_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ptl_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD CONSTRAINT "ptl_invoices_invoice_number_unique" UNIQUE("invoice_number");