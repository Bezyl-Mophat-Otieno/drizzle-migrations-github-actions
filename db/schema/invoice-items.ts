import { pgTable, uuid, varchar, numeric, integer } from "drizzle-orm/pg-core"
import { invoices } from "./invoices"

export const invoiceItems = pgTable("ptl_invoice_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  invoiceId: uuid("invoice_id")
    .references(() => invoices.id, { onDelete: "cascade" })
    .notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
})

export type InvoiceItem = typeof invoiceItems.$inferSelect
export type NewInvoiceItem = typeof invoiceItems.$inferInsert
