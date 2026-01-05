import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { Permission } from './permissions'

export const roles = pgTable('ptl_roles', {
  roleId: serial('role_id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})


export type Role = typeof roles.$inferSelect


export type NewRole = typeof roles.$inferInsert

export type RoleWithPermissions = Role & {
  permissions: Permission[]
}