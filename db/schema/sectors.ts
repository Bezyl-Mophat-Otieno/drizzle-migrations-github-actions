import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const sectors = pgTable('ptl_sectors', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})


export type Sector = typeof sectors.$inferSelect

export type NewSector = typeof sectors.$inferInsert