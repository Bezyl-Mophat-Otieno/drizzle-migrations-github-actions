import { pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

export const permissions = pgTable(
  'ptl_permissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    module: varchar('module', { length: 50 }).notNull(),
    submodule: varchar('submodule', { length: 50 }),
    action: varchar('action', { length: 50 }).notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('unique_permission').on(table.module, table.submodule, table.action)]
)


export type Permission = typeof permissions.$inferSelect


export type NewPermission = typeof permissions.$inferInsert