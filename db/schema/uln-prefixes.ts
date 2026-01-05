import { pgTable, uuid, varchar, boolean, timestamp, pgEnum, uniqueIndex, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const ulnTypeEnum = pgEnum("ptl_uln_type", ["UPI7", "UPI11", "UPI13"])

export const ulnPrefixes = pgTable(
  "ptl_uln_prefixes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    prefix: varchar("prefix", { length: 12 }).notNull(),
    type: ulnTypeEnum("type").notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    maxCompanies: integer("max_companies").notNull(),
    usedCount: integer("used_count").default(0).notNull(),
    nextSequenceNumber: integer("next_sequence_number").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_active_uln_prefix_idx").on(table.isActive).where(sql`${table.isActive} = true`),
    uniqueIndex("unique_uln_prefix_idx").on(table.prefix),
  ],
)

export type UlnPrefix = typeof ulnPrefixes.$inferSelect
export type NewUlnPrefix = typeof ulnPrefixes.$inferInsert
