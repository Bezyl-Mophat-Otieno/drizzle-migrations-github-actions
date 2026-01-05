CREATE TYPE "public"."ptl_service" AS ENUM('maintenance', 'code_generation', 'barcode_generation', 'qrcode_generation', 'skanKonnect', 'custom');--> statement-breakpoint
ALTER TYPE "public"."unit_of_measurement" ADD VALUE 'piece';--> statement-breakpoint
ALTER TYPE "public"."unit_of_measurement" ADD VALUE 'dozen';--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "service" SET DATA TYPE ptl_service USING 
  CASE 
    WHEN service = 'Maintenance Fee' THEN 'maintenance'::ptl_service
    WHEN service = 'Code Generation' THEN 'code_generation'::ptl_service
    WHEN service = 'Barcode Generation' THEN 'barcode_generation'::ptl_service
    WHEN service = 'QRCode Generation' THEN 'qrcode_generation'::ptl_service
    WHEN service = 'SkanKonnect' THEN 'skanKonnect'::ptl_service
    ELSE 'barcode_generation'::ptl_service
  END;--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "service" SET DEFAULT 'barcode_generation';--> statement-breakpoint
ALTER TABLE "ptl_invoices" ALTER COLUMN "service" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_transactions" ADD COLUMN "service" "ptl_service" DEFAULT 'barcode_generation';