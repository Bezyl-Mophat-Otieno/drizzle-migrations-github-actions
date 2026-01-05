import { pgTable, uuid, date, numeric, timestamp } from 'drizzle-orm/pg-core'
import { subscriptions } from './subscriptions'

export const carryForwards = pgTable('ptl_carry_forwards', {
  id: uuid('id').defaultRandom().primaryKey(),
  subscriptionId: uuid('subscription_id')
    .references(() => subscriptions.id)
    .notNull(),
  fromCycleStart: date('from_cycle_start').notNull(),
  fromCycleEnd: date('from_cycle_end').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  appliedToCycleStart: date('applied_to_cycle_start'),
  appliedToCycleEnd: date('applied_to_cycle_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})


export type CarryForward = typeof carryForwards.$inferSelect
export type NewCarryForward = typeof carryForwards.$inferInsert
