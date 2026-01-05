import { pgTable, uuid, varchar, text, timestamp, pgEnum, date } from "drizzle-orm/pg-core"
import { companies } from "./companies"

export const certificateTypeEnum = pgEnum("ptl_certificate_type", ["CIC", "ULN"])
export const certificateStatusEnum = pgEnum("ptl_certificate_status", ["active", "expired", "revoked"])

export const companyCertificates = pgTable("ptl_company_certificates", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  certificateType: certificateTypeEnum("certificate_type").notNull(),
  certificateNumber: varchar("certificate_number", { length: 100 }).notNull().unique(),
  description: text("description").notNull(),
  disclaimer: text("disclaimer").notNull(),
  footerText: text("footer_text").notNull(),
  dateOfIssue: date("date_of_issue").notNull(),
  renewalDate: date("renewal_date").notNull(),
  prefixUsed: varchar("prefix_used", { length: 50 }).notNull(),
  colorTheme: varchar("color_theme", { length: 100 }).default("default"),
  customColors: text("custom_colors"), // JSON string for custom color overrides
  signatureDirectorUrl: varchar("signature_director_url", { length: 500 }),
  signatureManagingDirectorUrl: varchar("signature_managing_director_url", { length: 500 }),
  qrCodeUrl: varchar("qr_code_url", { length: 500 }),
  pdfUrl: varchar("pdf_url", { length: 500 }),
  pdfKey: varchar("pdf_key", { length: 500 }), // For deletion from storage
  status: certificateStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type CompanyCertificate = typeof companyCertificates.$inferSelect
export type NewCompanyCertificate = typeof companyCertificates.$inferInsert
export type CertificateType = (typeof certificateTypeEnum.enumValues)[number]
export type CertificateStatus = (typeof certificateStatusEnum.enumValues)[number]
