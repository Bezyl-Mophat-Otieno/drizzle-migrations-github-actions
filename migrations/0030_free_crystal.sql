DROP INDEX "ptl_unique_categoryId_name_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_plan_per_category" ON "ptl_plans" USING btree ("category_id","name");