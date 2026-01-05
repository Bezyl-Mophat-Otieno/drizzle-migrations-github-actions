import { date, integer, numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { subscriptions } from './subscriptions'

export const subscriptionUsages = pgTable('ptl_subscription_usages', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id')
    .references(() => subscriptions.id)
    .notNull(),
  cycleStart: date('cycle_start').notNull(),
  cycleEnd: date('cycle_end').notNull(),
  generatedCodes: integer('generated_codes').notNull().default(0),
  extraCharges: numeric('extra_charges', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type SubscriptionUsage = typeof subscriptionUsages.$inferSelect
export type NewSubscriptionUsage = typeof subscriptionUsages.$inferInsert
