import { pgTable, uuid, varchar, timestamp, pgEnum, text } from 'drizzle-orm/pg-core'
import { companies } from './companies'

export const companyDocumentStatusEnum = pgEnum('ptl_company_document_status', ['accepted', 'declined', 'pending'])

export const companyDocuments = pgTable('ptl_company_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 1000 }).notNull(),
  status: companyDocumentStatusEnum('status').default('pending').notNull(),
  rejectionReason: text("RejectionReason"),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type CompanyDocument = typeof companyDocuments.$inferSelect
export type NewCompanyDocument = typeof companyDocuments.$inferInsert
export type CompanyDocumentStatus = (typeof companyDocumentStatusEnum.enumValues)[number]
