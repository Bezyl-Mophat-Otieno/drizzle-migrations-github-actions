CREATE TABLE "ptl_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"invoice_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"phone_number" varchar(15) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"mpesa_request_id" varchar(100),
	"checkout_request_id" varchar(100),
	"merchant_request_id" varchar(100),
	"mpesa_receipt_number" varchar(50),
	"stk_push_request" jsonb,
	"stk_push_response" jsonb,
	"callback_payload" jsonb,
	"description" text,
	"is_on_demand" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	"expires_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "ptl_companies" ALTER COLUMN "status" SET DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE "ptl_subscriptions" ALTER COLUMN "start_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ptl_subscriptions" ALTER COLUMN "start_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD CONSTRAINT "ptl_transactions_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD CONSTRAINT "ptl_transactions_user_id_ptl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD CONSTRAINT "ptl_transactions_invoice_id_ptl_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ptl_invoices"("id") ON DELETE no action ON UPDATE no action;
