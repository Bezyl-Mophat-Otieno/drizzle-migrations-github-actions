import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const settings = pgTable('ptl_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  category: text('category').default('general'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
