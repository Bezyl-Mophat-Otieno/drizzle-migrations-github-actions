CREATE TYPE "public"."user_status" AS ENUM('pending', 'active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."verification_token_type" AS ENUM('email', 'reset');--> statement-breakpoint
CREATE TYPE "public"."company_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."company_document_status" AS ENUM('accepted', 'declined', 'pending');--> statement-breakpoint
CREATE TYPE "public"."ptl_billing_cycle" AS ENUM('monthly', 'semi_annually', 'annually');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('in-production', 'out-production');--> statement-breakpoint
CREATE TYPE "public"."ptl_subscription_status" AS ENUM('active', 'pending', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."upi_type" AS ENUM('UPI7', 'UPI11', 'UPI13');--> statement-breakpoint
CREATE TABLE "ptl_refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"user_agent" text,
	"ip" varchar(100),
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ptl_refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "ptl_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"country_code" varchar(5) DEFAULT '+254',
	"phone_number" varchar(20),
	"avatar" varchar(500),
	"password_hash" varchar(255) NOT NULL,
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"email_verified_at" timestamp,
	"company_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ptl_users_username_unique" UNIQUE("username"),
	CONSTRAINT "ptl_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ptl_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"type" "verification_token_type" NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ptl_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "ptl_barcodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"upi_prefix_id" uuid NOT NULL,
	"sequence_number" varchar(10) NOT NULL,
	"barcode_number" varchar(15) NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ptl_barcodes_barcode_number_unique" UNIQUE("barcode_number")
);
--> statement-breakpoint
CREATE TABLE "ptl_carry_forwards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"from_cycle_start" date NOT NULL,
	"from_cycle_end" date NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"applied_to_cycle_start" date,
	"applied_to_cycle_end" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"physical_address" text NOT NULL,
	"country" varchar(100) NOT NULL,
	"website_url" varchar(255),
	"logo_url" varchar(500),
	"status" "company_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_company_directors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(30) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_company_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"file_url" varchar(1000) NOT NULL,
	"status" "company_document_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_company_sectors" (
	"company_id" uuid NOT NULL,
	"sector_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"invoice_date" timestamp DEFAULT now() NOT NULL,
	"due_date" date,
	"status" varchar(20) DEFAULT 'pending',
	"total_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module" varchar(50) NOT NULL,
	"submodule" varchar(50),
	"action" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"maintenance_fee" integer NOT NULL,
	"barcode_fee" integer NOT NULL,
	"billingCycle" "ptl_billing_cycle" DEFAULT 'annually' NOT NULL,
	"usage_limit" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"barcode_id" uuid,
	"qr_code_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"unit_of_measurement" varchar(50) NOT NULL,
	"net_weight" numeric(10, 3) NOT NULL,
	"country_of_issue" varchar(100) NOT NULL,
	"size" varchar(100),
	"color" varchar(50),
	"image_url" text,
	"status" "product_status" DEFAULT 'in-production' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_qr_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"qr_code_image_url" text NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_roles_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ptl_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ptl_sectors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ptl_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "ptl_subscription_usages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"cycle_start" date NOT NULL,
	"cycle_end" date NOT NULL,
	"generated_codes" integer DEFAULT 0 NOT NULL,
	"extra_charges" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"status" "ptl_subscription_status" DEFAULT 'active' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"current_period_start" date NOT NULL,
	"current_period_end" date NOT NULL,
	"next_billing_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_upi_prefixes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"prefix" varchar(12) NOT NULL,
	"type" "upi_type" NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"max_products" integer NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"next_sequence_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ptl_users_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ptl_refresh_tokens" ADD CONSTRAINT "ptl_refresh_tokens_user_id_ptl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ptl_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_verification_tokens" ADD CONSTRAINT "ptl_verification_tokens_user_id_ptl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ptl_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_barcodes" ADD CONSTRAINT "ptl_barcodes_product_id_ptl_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."ptl_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_barcodes" ADD CONSTRAINT "ptl_barcodes_upi_prefix_id_ptl_upi_prefixes_id_fk" FOREIGN KEY ("upi_prefix_id") REFERENCES "public"."ptl_upi_prefixes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_carry_forwards" ADD CONSTRAINT "ptl_carry_forwards_subscription_id_ptl_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."ptl_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_companies" ADD CONSTRAINT "ptl_companies_user_id_ptl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ptl_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_companies" ADD CONSTRAINT "ptl_companies_category_id_ptl_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."ptl_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_company_directors" ADD CONSTRAINT "ptl_company_directors_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_company_documents" ADD CONSTRAINT "ptl_company_documents_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_company_sectors" ADD CONSTRAINT "ptl_company_sectors_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_company_sectors" ADD CONSTRAINT "ptl_company_sectors_sector_id_ptl_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "public"."ptl_sectors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_invoice_items" ADD CONSTRAINT "ptl_invoice_items_invoice_id_ptl_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."ptl_invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ADD CONSTRAINT "ptl_invoices_subscription_id_ptl_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."ptl_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_plans" ADD CONSTRAINT "ptl_plans_category_id_ptl_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."ptl_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_products" ADD CONSTRAINT "ptl_products_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_qr_codes" ADD CONSTRAINT "ptl_qr_codes_product_id_ptl_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."ptl_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_roles_permissions" ADD CONSTRAINT "ptl_roles_permissions_role_id_ptl_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."ptl_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_roles_permissions" ADD CONSTRAINT "ptl_roles_permissions_permission_id_ptl_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."ptl_permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_subscription_usages" ADD CONSTRAINT "ptl_subscription_usages_subscription_id_ptl_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."ptl_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_subscriptions" ADD CONSTRAINT "ptl_subscriptions_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_subscriptions" ADD CONSTRAINT "ptl_subscriptions_plan_id_ptl_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."ptl_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_upi_prefixes" ADD CONSTRAINT "ptl_upi_prefixes_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_users_roles" ADD CONSTRAINT "ptl_users_roles_user_id_ptl_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."ptl_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_users_roles" ADD CONSTRAINT "ptl_users_roles_role_id_ptl_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."ptl_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ptl_unique_email_idx" ON "ptl_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "ptl_unique_username_idx" ON "ptl_users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_company_sector" ON "ptl_company_sectors" USING btree ("company_id","sector_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_permission" ON "ptl_permissions" USING btree ("module","submodule","action");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_role_permission" ON "ptl_roles_permissions" USING btree ("role_id","permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_upi_per_company" ON "ptl_upi_prefixes" USING btree ("company_id") WHERE "ptl_upi_prefixes"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_upi_prefix" ON "ptl_upi_prefixes" USING btree ("prefix");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_role" ON "ptl_users_roles" USING btree ("user_id","role_id");
