import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import {Role} from "./roles"

export const userStatusEnum = pgEnum('ptl_user_status', ['pending', 'active', 'suspended'])

export const users = pgTable(
  'ptl_users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    username: varchar('username', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    countryCode: varchar('country_code', { length: 5 }).default('+254'),
    phoneNumber: varchar('phone_number', { length: 20 }),
    avatar: varchar('avatar', { length: 500 }),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    status: userStatusEnum('status').default('pending').notNull(),
    emailVerifiedAt: timestamp('email_verified_at'),
    companyId: uuid('company_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('ptl_unique_email_idx').on(table.email),
  ]
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserRole = User &  {
  roles: Role[]
}

export const verificationTokenType = pgEnum('verification_token_type', ['email', 'reset'])

export const verificationTokens = pgTable('ptl_verification_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  type: verificationTokenType('type').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type VerificationToken = typeof verificationTokens.$inferSelect
export type NewVerificationToken = typeof verificationTokens.$inferInsert

export const refreshTokens = pgTable('ptl_refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  userAgent: text('user_agent'),
  ip: varchar('ip', { length: 100 }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type RefreshToken = typeof refreshTokens.$inferSelect
export type NewRefreshToken = typeof refreshTokens.$inferInsert
