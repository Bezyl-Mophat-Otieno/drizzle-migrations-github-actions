-- Fix role ID structure migration
-- Convert from UUID-based role references to integer-based

-- Step 1: Drop existing foreign key constraints
ALTER TABLE "ptl_roles_permissions" DROP CONSTRAINT IF EXISTS "ptl_roles_permissions_uuid_role_id_ptl_roles_id_fk";
ALTER TABLE "ptl_users_roles" DROP CONSTRAINT IF EXISTS "ptl_users_roles_uuid_role_id_ptl_roles_id_fk";

-- Step 2: Add new integer role_id columns to foreign key tables
ALTER TABLE "ptl_roles_permissions" ADD COLUMN "role_id" integer;
ALTER TABLE "ptl_users_roles" ADD COLUMN "role_id" integer;

-- Step 3: Populate the new integer columns with values from the roles table
UPDATE "ptl_roles_permissions" 
SET "role_id" = r."role_id"
FROM "ptl_roles" r 
WHERE "ptl_roles_permissions"."uuid_role_id" = r."id";

UPDATE "ptl_users_roles" 
SET "role_id" = r."role_id"
FROM "ptl_roles" r 
WHERE "ptl_users_roles"."uuid_role_id" = r."id";

-- Step 4: Make the new columns NOT NULL
ALTER TABLE "ptl_roles_permissions" ALTER COLUMN "role_id" SET NOT NULL;
ALTER TABLE "ptl_users_roles" ALTER COLUMN "role_id" SET NOT NULL;

-- Step 5: Drop the old UUID columns
ALTER TABLE "ptl_roles_permissions" DROP COLUMN "uuid_role_id";
ALTER TABLE "ptl_users_roles" DROP COLUMN "uuid_role_id";

-- Step 6: Drop the UUID primary key from roles and make role_id the primary key
ALTER TABLE "ptl_roles" DROP CONSTRAINT "ptl_roles_pkey";
ALTER TABLE "ptl_roles" DROP COLUMN "id";
ALTER TABLE "ptl_roles" ADD PRIMARY KEY ("role_id");

-- Step 7: Add foreign key constraints for the new integer columns
ALTER TABLE "ptl_roles_permissions" 
ADD CONSTRAINT "ptl_roles_permissions_role_id_ptl_roles_role_id_fk" 
FOREIGN KEY ("role_id") REFERENCES "ptl_roles"("role_id") ON DELETE cascade;

ALTER TABLE "ptl_users_roles" 
ADD CONSTRAINT "ptl_users_roles_role_id_ptl_roles_role_id_fk" 
FOREIGN KEY ("role_id") REFERENCES "ptl_roles"("role_id") ON DELETE cascade;

-- Step 8: Recreate unique indexes with correct column names
DROP INDEX IF EXISTS "unique_role_permission";
CREATE UNIQUE INDEX "unique_role_permission" ON "ptl_roles_permissions" ("role_id", "permission_id");

DROP INDEX IF EXISTS "unique_user_role";
CREATE UNIQUE INDEX "unique_user_role" ON "ptl_users_roles" ("user_id", "role_id");