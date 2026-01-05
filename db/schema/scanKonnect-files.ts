import { pgTable, uuid, varchar, bigint, timestamp } from "drizzle-orm/pg-core"
import { scankonnectQrcodes } from "./scanKonnect-qrcodes"

export const scankonnectFiles = pgTable("ptl_scankonnect_files", {
  id: uuid("id").defaultRandom().primaryKey(),
  scanKonnectQrcodeId: uuid("scan_konnect_qrcode_id")
    .references(() => scankonnectQrcodes.id, { onDelete: "cascade" })
    .notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
})

export type ScanKonnectFile = typeof scankonnectFiles.$inferSelect
export type NewScanKonnectFile = typeof scankonnectFiles.$inferInsert
