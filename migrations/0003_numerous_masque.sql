ALTER TABLE "ptl_subscriptions" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "ptl_subscriptions" ALTER COLUMN "start_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "ptl_subscriptions" ALTER COLUMN "current_period_start" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_subscriptions" ALTER COLUMN "current_period_end" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_subscriptions" ALTER COLUMN "next_billing_date" DROP NOT NULL;
