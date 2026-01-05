import { integer, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export const scankonnectCadenceEnum = pgEnum("ptl_scankonnect_cadence", [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
  "semi-yearly",
])

export const scankonnectPlanStatusEnum = pgEnum("ptl_scankonnect_plan_status", ["active", "inactive"])

export const scankonnectPlans = pgTable("ptl_scankonnect_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  amount: integer("amount").notNull(),
  cadence: scankonnectCadenceEnum().notNull(),
  status: scankonnectPlanStatusEnum().default("active").notNull(),
  maxFiles: integer("max_files").notNull().default(5),
  maxFileSize: integer("max_file_size").notNull().default(20),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export type ScanKonnectPlan = typeof scankonnectPlans.$inferSelect
export type NewScanKonnectPlan = typeof scankonnectPlans.$inferInsert
export type ScankonnectCadence = (typeof scankonnectCadenceEnum.enumValues)[number]
export type ScankonnectPlanStatus = (typeof scankonnectPlanStatusEnum.enumValues)[number]
