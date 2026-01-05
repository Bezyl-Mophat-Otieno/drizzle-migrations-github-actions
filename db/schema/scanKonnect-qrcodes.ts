import { pgTable, uuid, varchar, text, boolean, timestamp, integer, pgEnum, jsonb } from "drizzle-orm/pg-core"
import { users } from "./auth-users"
import { scankonnectPlans } from "./scanKonnect-plans"

export const scankonnectStatusEnum = pgEnum("ptl_scankonnect_status", ["active", "expired", "suspended", "deleted"])

export const scankonnectQrcodes = pgTable("ptl_scankonnect_qrcodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  planId: uuid("plan_id")
    .references(() => scankonnectPlans.id, { onDelete: "restrict" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  qrCodeUrl: varchar("qr_code_url"),
  socialMediaLinks: jsonb("social_media_links").$type<Record<string, string>[]>(),
  videoUrls: jsonb("video_urls").$type<string[]>(),
  enableFeedbackRating: boolean("enable_feedback_rating").default(false).notNull(),
  filesRequired: boolean("files_required").default(true).notNull(),
  expiresOn: timestamp("expires_on", { withTimezone: true }).notNull(),
  status: scankonnectStatusEnum().default("active").notNull(),
  scans: integer("scans").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export type ScanKonnectQrcode = typeof scankonnectQrcodes.$inferSelect
export type NewScanKonnectQrcode = typeof scankonnectQrcodes.$inferInsert
export type ScankonnectStatus = (typeof scankonnectStatusEnum.enumValues)[number]
