ALTER TABLE "ptl_roles_permissions" RENAME COLUMN "role_id" TO "uuid_role_id";--> statement-breakpoint
ALTER TABLE "ptl_roles_permissions" DROP CONSTRAINT "ptl_roles_permissions_role_id_ptl_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "ptl_users_roles" DROP CONSTRAINT "ptl_users_roles_role_id_ptl_roles_id_fk";
--> statement-breakpoint
DROP INDEX "unique_role_permission";--> statement-breakpoint
DROP INDEX "unique_user_role";--> statement-breakpoint
ALTER TABLE "ptl_roles" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ptl_roles" ADD COLUMN "role_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_users_roles" ADD COLUMN "uuid_role_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "ptl_roles_permissions" ADD CONSTRAINT "ptl_roles_permissions_uuid_role_id_ptl_roles_id_fk" FOREIGN KEY ("uuid_role_id") REFERENCES "public"."ptl_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ptl_users_roles" ADD CONSTRAINT "ptl_users_roles_uuid_role_id_ptl_roles_id_fk" FOREIGN KEY ("uuid_role_id") REFERENCES "public"."ptl_roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_role_permission" ON "ptl_roles_permissions" USING btree ("uuid_role_id","permission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_role" ON "ptl_users_roles" USING btree ("user_id","uuid_role_id");--> statement-breakpoint
ALTER TABLE "ptl_users_roles" DROP COLUMN "role_id";