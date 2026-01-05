import { pgTable, serial, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { permissions } from './permissions'
import { roles } from './roles'

export const rolesPermissions = pgTable(
  'ptl_roles_permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    roleId: serial('role_id')
    .notNull()
    .default(1)
    .references(() => roles.roleId, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id')
      .notNull()
      .references(() => permissions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('unique_role_permission').on(table.roleId, table.permissionId)]
)
export type RolesPermissions = typeof rolesPermissions.$inferSelect
export type NewRolesPermission = typeof rolesPermissions.$inferInsert

