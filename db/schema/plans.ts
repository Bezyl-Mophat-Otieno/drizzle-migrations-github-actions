import { integer, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { categories } from './categories'

export const billingCycleEnum = pgEnum('ptl_billing_cycle', ['monthly', 'semi_annually', 'annually'])

export const plans = pgTable('ptl_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id')
    .references(() => categories.id)
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  maintenanceFee: integer('maintenance_fee').notNull(),
  codeFee: integer('barcode_fee').notNull(),
  billingCycle: billingCycleEnum().default('annually').notNull(), // yearly, monthly
  usageLimit: integer('usage_limit').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
},  (table) => [
    uniqueIndex('unique_plan_per_category').on(table.categoryId, table.name),
  ])


export type Plan = typeof plans.$inferSelect
export type NewPlan = typeof plans.$inferInsert
export type billingCycle = (typeof billingCycleEnum.enumValues)[number]
