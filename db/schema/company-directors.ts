import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'
import { companies } from './companies'

export const companyDirectors = pgTable('ptl_company_directors', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 30 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type CompanyDirector = typeof companyDirectors.$inferSelect
export type NewCompanyDirector = typeof companyDirectors.$inferInsert