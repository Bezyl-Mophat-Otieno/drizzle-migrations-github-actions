import { boolean, date, numeric, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { users } from "./auth-users"
import { companies } from "./companies"

export const invoiceTypeEnum = pgEnum("ptl_invoice_type", ["commercial_invoice", "proforma_invoice"])

export const invoiceStatusEnum = pgEnum("ptl_invoice_status", ["unpaid", "paid", "overdue","cancelled"])
export const ptlServiceEnum = pgEnum("ptl_service", ["maintenance", "code_generation", "barcode_generation", "qrcode_generation", "skanKonnect", "exclusive_qr_codes_maintenance","custom"])


export const invoices = pgTable("ptl_invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),

  // Invoice details
  service: ptlServiceEnum("service").default("barcode_generation"), // e.g., "Maintenance fee", "Barcode generation"
  notes: text("notes"),
  adminNotes: text("adminNotes"),
  preparedBy: varchar("prepared_by", { length: 255 }).notNull(),

  // Dates
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),

  // Amounts
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),

  // Status and PDF
  status: invoiceStatusEnum("status").default("unpaid").notNull(), // unpaid, paid, overdue
  pdfUrl: varchar("pdf_url", { length: 500 }),
  pdfKey: varchar("pdf_key", { length: 500 }), // S3 key for deletion
  generatedAt: timestamp("generated_at"),
  paidAt: timestamp("paid_at"),

  // Email tracking
  emailSentAt: timestamp("email_sent_at"),
  emailSentTo: varchar("email_sent_to", { length: 255 }),

  // Soft delete
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  deletedBy: uuid("deleted_by").references(() => users.id),
  invoiceType: invoiceTypeEnum("invoice_type").default("commercial_invoice").notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
export type InvoiceType = (typeof invoiceTypeEnum.enumValues)[number]
export type InvoiceStatus = (typeof invoiceStatusEnum.enumValues)[number]
export type PtlService = (typeof ptlServiceEnum.enumValues)[number]

