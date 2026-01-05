import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { type User, users } from "./auth-users"
import { categories, type Category } from "./categories"
import type { CompanyDirector } from "./company-directors"
import type { CompanyDocument } from "./company-documents"
import type { CompanySector } from "./company-sectors"
import type { Sector } from "./sectors"
import type { Subscription } from "./subscriptions"
import { ulnPrefixes } from "./uln-prefixes"

export const companyStatusEnum = pgEnum("ptl_company_status", ["active", "inactive"])

export const companies = pgTable("ptl_companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  categoryId: uuid("category_id").references(() => categories.id),
  name: varchar("name", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  physicalAddress: text("physical_address").notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  websiteUrl: varchar("website_url", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  ulnNumber: varchar("uln_number", { length: 15 }),
  ulnPrefixId: uuid("uln_prefix_id").references(() => ulnPrefixes.id),
  status: companyStatusEnum("status").default("inactive").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Company = typeof companies.$inferSelect
export type NewCompany = typeof companies.$inferInsert
export type CompanyStatus = (typeof companyStatusEnum.enumValues)[number]

export type CompanyWithAssociations = {
  user: User
  company: Company
  sectors: Sector[]
  directors?: CompanyDirector[]
  documents?: CompanyDocument[]
  companySectors?: CompanySector[]
  categories: Category[]
  subscription?: Subscription
}
