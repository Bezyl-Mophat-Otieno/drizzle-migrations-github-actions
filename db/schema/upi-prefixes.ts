import { pgTable, uuid, varchar, boolean, timestamp, pgEnum, uniqueIndex, integer } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { companies } from './companies'

export const upiTypeEnum = pgEnum('ptl_upi_type', ['UPI7', 'UPI11', 'UPI13'])

export const upiPrefixes = pgTable(
  'ptl_upi_prefixes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .references(() => companies.id, { onDelete: 'cascade' })
      .notNull(),
    prefix: varchar('prefix', { length: 12 }).notNull(),
    type: upiTypeEnum('type').notNull(),
    isActive: boolean('is_active').default(false).notNull(),
    maxProducts: integer('max_products').notNull(),
    usedCount: integer('used_count').default(0).notNull(),
    nextSequenceNumber: integer('next_sequence_number').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_active_upi_per_company')
      .on(table.companyId)
      .where(sql`${table.isActive} = true`),
    uniqueIndex('unique_upi_prefix').on(table.prefix),
  ]
)

export type UpiPrefix = typeof upiPrefixes.$inferSelect
export type NewUpiPrefix = typeof upiPrefixes.$inferInsert
