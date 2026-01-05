import { pgTable, serial, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth-users'
import { roles } from './roles'

export const usersRoles = pgTable(
  'ptl_users_roles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
      roleId: serial('role_id')
      .notNull()
      .default(1)
      .references(() => roles.roleId, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('unique_user_role').on(table.userId, table.roleId)]
)
