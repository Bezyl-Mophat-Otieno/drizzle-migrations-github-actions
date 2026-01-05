CREATE TYPE "public"."certificate_status" AS ENUM('active', 'expired', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."certificate_type" AS ENUM('CIC', 'ULN');--> statement-breakpoint
CREATE TABLE "ptl_company_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"certificate_type" "certificate_type" NOT NULL,
	"certificate_number" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"disclaimer" text NOT NULL,
	"footer_text" text NOT NULL,
	"date_of_issue" date NOT NULL,
	"renewal_date" date NOT NULL,
	"prefix_used" varchar(50) NOT NULL,
	"color_theme" varchar(100) DEFAULT 'default',
	"custom_colors" text,
	"signature_director" varchar(500),
	"signature_managing_director" varchar(500),
	"qr_code_url" varchar(500),
	"pdf_url" varchar(500),
	"pdf_key" varchar(500),
	"status" "certificate_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ptl_company_certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
ALTER TABLE "ptl_company_certificates" ADD CONSTRAINT "ptl_company_certificates_company_id_ptl_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."ptl_companies"("id") ON DELETE cascade ON UPDATE no action;