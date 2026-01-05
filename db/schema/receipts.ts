import { pgTable, uuid, varchar, numeric, timestamp, text, jsonb, boolean } from "drizzle-orm/pg-core"
import { transactions } from "./transactions"
import { invoices } from "./invoices"
import { users } from "./auth-users"

export const receipts = pgTable("ptl_receipts", {
  id: uuid("id").defaultRandom().primaryKey(),
  receiptNumber: varchar("receipt_number", { length: 50 }).notNull().unique(),
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  invoiceId: uuid("invoice_id")
    .references(() => invoices.id),
  
  // Receipt details
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // mpesa, cheque, bank_transfer, etc.
  
  // File storage
  pdfUrl: varchar("pdf_url", { length: 500 }),
  pdfKey: varchar("pdf_key", { length: 500 }), // For deletion
  
  // Email tracking
  emailSentAt: timestamp("email_sent_at"),
  emailSentTo: varchar("email_sent_to", { length: 255 }),
  
  // Additional metadata
  notes: text("notes"),
  metadata: jsonb("metadata"), // Store any additional receipt data
  
  // Soft delete
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  deletedBy: uuid("deleted_by").references(() => users.id),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Receipt = typeof receipts.$inferSelect
export type NewReceipt = typeof receipts.$inferInsert
