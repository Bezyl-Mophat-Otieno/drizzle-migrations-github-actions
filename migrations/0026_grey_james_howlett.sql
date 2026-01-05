ALTER TYPE "public"."user_status" RENAME TO "ptl_user_status";--> statement-breakpoint
ALTER TYPE "public"."company_status" RENAME TO "ptl_company_status";--> statement-breakpoint
ALTER TYPE "public"."certificate_status" RENAME TO "ptl_certificate_status";--> statement-breakpoint
ALTER TYPE "public"."certificate_type" RENAME TO "ptl_certificate_type";--> statement-breakpoint
ALTER TYPE "public"."company_document_status" RENAME TO "ptl_company_document_status";--> statement-breakpoint
ALTER TYPE "public"."invoice_status" RENAME TO "ptl_invoice_status";--> statement-breakpoint
ALTER TYPE "public"."invoice_type" RENAME TO "ptl_invoice_type";--> statement-breakpoint
ALTER TYPE "public"."country_of_issue" RENAME TO "ptl_country_of_issue";--> statement-breakpoint
ALTER TYPE "public"."product_status" RENAME TO "ptl_product_status";--> statement-breakpoint
ALTER TYPE "public"."unit_of_measurement" RENAME TO "ptl_unit_of_measurement";--> statement-breakpoint
ALTER TYPE "public"."payment_method" RENAME TO "ptl_payment_method";--> statement-breakpoint
ALTER TYPE "public"."transaction_status" RENAME TO "ptl_transaction_status";--> statement-breakpoint
ALTER TYPE "public"."uln_type" RENAME TO "ptl_uln_type";--> statement-breakpoint
ALTER TYPE "public"."upi_type" RENAME TO "ptl_upi_type";--> statement-breakpoint
ALTER TABLE "ptl_invoices" RENAME TO "ptlptl_invoices";--> statement-breakpoint
ALTER TABLE "ptlptl_invoices" DROP CONSTRAINT "ptl_invoices_invoice_number_unique";--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" DROP CONSTRAINT "ptl_invoice_items_invoice_id_ptl_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "ptlptl_invoices" DROP CONSTRAINT "ptl_invoices_company_id_ptl_companies_id_fk";
--> statement-breakpoint
ALTER TABLE "ptlptl_invoices" DROP CONSTRAINT "ptl_invoices_created_by_ptl_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ptlptl_invoices" DROP CONSTRAINT "ptl_invoices_deleted_by_ptl_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_receipts" DROP CONSTRAINT "ptl_receipts_invoice_id_ptl_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_transactions" DROP CONSTRAINT "ptl_transactions_invoice_id_ptl_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" ADD CONSTRAINT "ptl_invoice_items_invoice_id_ptlptl_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ptlptl_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptlptl_invoices" ADD CONSTRAINT "ptlptl_invoices_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptlptl_invoices" ADD CONSTRAINT "ptlptl_invoices_created_by_ptl_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptlptl_invoices" ADD CONSTRAINT "ptlptl_invoices_deleted_by_ptl_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_receipts" ADD CONSTRAINT "ptl_receipts_invoice_id_ptlptl_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ptlptl_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD CONSTRAINT "ptl_transactions_invoice_id_ptlptl_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ptlptl_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptlptl_invoices" ADD CONSTRAINT "ptlptl_invoices_invoice_number_unique" UNIQUE("invoice_number");