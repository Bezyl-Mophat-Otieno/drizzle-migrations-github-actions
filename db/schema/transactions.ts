import { boolean, jsonb, numeric, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { users } from "./auth-users"
import { companies } from "./companies"
import { invoices, ptlServiceEnum } from "./invoices"

export const transactionStatusEnum = pgEnum("ptl_transaction_status", ["pending", "paid", "failed", "expired"])
export const paymentMethodEnum = pgEnum("ptl_payment_method", ["mpesa", "cheque", "standing_order", "bank_transfer", "cash", "other"])

export const transactions = pgTable("ptl_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .references(() => companies.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  invoiceId: uuid("invoice_id").references(() => invoices.id),

  // Transaction details
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 15 }),
  status: transactionStatusEnum("status").default("pending").notNull(),
  service: ptlServiceEnum("service").default("barcode_generation"), // e.g., "Maintenance fee", "Barcode generation"
  

  methodOfPayment: paymentMethodEnum("method_of_payment").default("mpesa"),
  chequeNumber: varchar("cheque_number", { length: 100 }),
  bankReference: varchar("bank_reference", { length: 100 }),

  // MPesa specific fields
  mpesaRequestId: varchar("mpesa_request_id", { length: 100 }),
  checkoutRequestId: varchar("checkout_request_id", { length: 100 }),
  merchantRequestId: varchar("merchant_request_id", { length: 100 }),
  mpesaReceiptNumber: varchar("mpesa_receipt_number", { length: 50 }),

  // STK Push request/response storage
  stkPushRequest: jsonb("stk_push_request"), // Store initial request payload
  stkPushResponse: jsonb("stk_push_response"), // Store Safaricom sync response
  callbackPayload: jsonb("callback_payload"), // Store full callback payload

  // Metadata
  description: text("description"),
  isOnDemand: boolean("is_on_demand").default(true).notNull(), // true for on-demand, false for pre-existing invoice

  reconciled: boolean("reconciled").default(false).notNull(),
  addedBy: varchar("added_by", { length: 255 }).default("System"), // System or admin name
  addedById: uuid("added_by_id").references(() => users.id),
  currency: varchar("currency", { length: 10 }).default("KES"),

  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  deletedBy: uuid("deleted_by").references(() => users.id),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
  expiresAt: timestamp("expires_at"), // STK push expiry time
})

export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert

export type TransactionStatus = typeof transactionStatusEnum.enumValues[number]
export type PaymentMethod = typeof paymentMethodEnum.enumValues[number]

