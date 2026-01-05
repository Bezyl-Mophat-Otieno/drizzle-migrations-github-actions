ALTER TABLE "ptl_companies" ADD CONSTRAINT "ptl_companies_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "ptl_companies" ADD CONSTRAINT "ptl_companies_email_unique" UNIQUE("email");