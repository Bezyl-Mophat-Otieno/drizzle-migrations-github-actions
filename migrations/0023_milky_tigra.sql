CREATE TYPE "public"."invoice_status" AS ENUM('unpaid', 'paid', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('mpesa', 'cheque', 'standing_order', 'bank_transfer', 'cash', 'other');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'paid', 'failed', 'expired');--> statement-breakpoint
ALTER TABLE "ptl_products" RENAME COLUMN "country_of_issue" TO "country_of_sale";--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "status" SET DATA TYPE invoice_status USING status::invoice_status;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "status" SET DEFAULT 'unpaid';--> statement-breakpoint
ALTER TABLE "ptl_transactions" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ALTER COLUMN "status" SET DATA TYPE transaction_status USING status::transaction_status;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "ptl_transactions" ALTER COLUMN "method_of_payment" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ALTER COLUMN "method_of_payment" SET DATA TYPE payment_method USING method_of_payment::payment_method;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ALTER COLUMN "method_of_payment" SET DEFAULT 'mpesa';