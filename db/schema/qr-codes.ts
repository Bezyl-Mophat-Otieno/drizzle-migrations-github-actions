import { pgTable, uuid, text, boolean, timestamp, integer } from "drizzle-orm/pg-core"
import { products } from "./products"

export const qrCodes = pgTable("ptl_qr_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  qrCodeImageUrl: text("qr_code_image_url"),
  scanCount: integer("scan_count").default(0).notNull(),
  lastScannedAt: timestamp("last_scanned_at", { withTimezone: true }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export type QrCode = typeof qrCodes.$inferSelect
export type NewQrCode = typeof qrCodes.$inferInsert
