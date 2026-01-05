import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { scankonnectQrcodes } from "./scanKonnect-qrcodes"

export const scankonnectFeedbackRatings = pgTable("ptl_tescankonnect_feedback_ratings", {
  id: uuid("id").defaultRandom().primaryKey(),
  scanKonnectQrcodeId: uuid("scan_konnect_qrcode_id")
    .references(() => scankonnectQrcodes.id, { onDelete: "cascade" })
    .notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  feedbackText: text("feedback_text"),
  rating: integer("rating").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export type ScanKonnectFeedbackRating = typeof scankonnectFeedbackRatings.$inferSelect
export type NewScanKonnectFeedbackRating = typeof scankonnectFeedbackRatings.$inferInsert
