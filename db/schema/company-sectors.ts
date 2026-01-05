import { pgTable, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { companies } from './companies'
import { sectors } from './sectors'

export const companySectors = pgTable(
  'ptl_company_sectors',
  {
    companyId: uuid('company_id')
      .references(() => companies.id)
      .notNull(),
    sectorId: uuid('sector_id')
      .references(() => sectors.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('unique_company_sector').on(table.companyId, table.sectorId)]
)

export type NewCompanySector = typeof companySectors.$inferInsert
export type CompanySector = typeof companySectors.$inferSelect
