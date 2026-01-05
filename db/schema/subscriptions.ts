import { date, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { companies } from './companies'
import { plans } from './plans'

export const subscriptionStatusEnum = pgEnum('ptl_subscription_status', ['active', 'pending', 'canceled', 'inactive'])
export const subscriptions = pgTable('ptl_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .references(() => companies.id)
    .notNull(),
  planId: uuid('plan_id')
    .references(() => plans.id)
    .notNull(),
  status: subscriptionStatusEnum().default('pending').notNull(),
  startDate: date('start_date', {mode: 'date'}),
  endDate: date('end_date', {mode: 'date'}),
  currentPeriodStart: date('current_period_start', {mode: 'date'}),
  currentPeriodEnd: date('current_period_end', {mode: 'date'}),
  nextBillingDate: date('next_billing_date', {mode: 'date'}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
},   (table) => [uniqueIndex('unique_company_plan_status').on(table.companyId, table.planId, table.status)])

export type subscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number]
export type Subscription = typeof subscriptions.$inferSelect
export type NewSubscription = typeof subscriptions.$inferInsert
