import { drizzle } from 'drizzle-orm/node-postgres'
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod"
import { Pool } from 'pg'
import { users } from "./schema/auth-users"
import { barcodes } from "./schema/barcodes"
import { carryForwards } from "./schema/carry-forward"
import { categories } from "./schema/categories"
import { companies } from "./schema/companies"
import { companyDirectors } from "./schema/company-directors"
import { companyDocuments } from "./schema/company-documents"
import { companySectors } from "./schema/company-sectors"
import { invoiceItems } from "./schema/invoice-items"
import { invoices } from "./schema/invoices"
import { permissions } from "./schema/permissions"
import { plans } from "./schema/plans"
import { products } from "./schema/products"
import { qrCodes } from "./schema/qr-codes"
import { roles } from "./schema/roles"
import { rolesPermissions } from "./schema/roles-permissions"
import { scankonnectFeedbackRatings } from "./schema/scanKonnect-feedback-ratings"
import { scankonnectFiles } from "./schema/scanKonnect-files"
import { scankonnectPlans } from "./schema/scanKonnect-plans"
import { scankonnectQrcodes } from "./schema/scanKonnect-qrcodes"
import { sectors } from "./schema/sectors"
import { settings } from "./schema/settings"
import { subscriptionUsages } from "./schema/subscription-usages"
import { subscriptions } from "./schema/subscriptions"
import { transactions } from "./schema/transactions"
import { ulnPrefixes } from "./schema/uln-prefixes"
import { upiPrefixes } from "./schema/upi-prefixes"
import { usersRoles } from "./schema/users-roles"

type Schema = {
  users: typeof users
  permissions: typeof permissions
  roles: typeof roles
  rolesPermissions: typeof rolesPermissions
  usersRoles: typeof usersRoles
  settings: typeof settings
  products: typeof products
  upiPrefixes: typeof upiPrefixes
  categories: typeof categories
  plans: typeof plans
  subscriptions: typeof subscriptions
  subscriptionUsages: typeof subscriptionUsages
  invoices: typeof invoices
  invoiceItems: typeof invoiceItems
  carryForwards: typeof carryForwards
  companies: typeof companies
  companyDirectors: typeof companyDirectors
  companyDocuments: typeof companyDocuments
  companySectors: typeof companySectors
  barcodes: typeof barcodes
  qrCodes: typeof qrCodes
  sectors: typeof sectors
  transactions: typeof transactions
  ulnPrefixes: typeof ulnPrefixes
  scankonnectPlans: typeof scankonnectPlans
  scankonnectQrcodes: typeof scankonnectQrcodes
  scankonnectFiles: typeof scankonnectFiles
  scankonnectFeedbackRatings: typeof scankonnectFeedbackRatings
}

export const schema: Schema = {
  users,
  permissions,
  roles,
  rolesPermissions,
  usersRoles,
  settings,
  products,
  upiPrefixes,
  categories,
  plans,
  subscriptions,
  subscriptionUsages,
  invoices,
  invoiceItems,
  carryForwards,
  companies,
  companyDirectors,
  companyDocuments,
  companySectors,
  barcodes,
  qrCodes,
  sectors,
  transactions,
  ulnPrefixes,
  scankonnectPlans,
  scankonnectQrcodes,
  scankonnectFiles,
  scankonnectFeedbackRatings,
}

let dbInstance: ReturnType<typeof drizzle>
let pool: Pool


export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    })
  }
  return pool
}

function getDbInstance() {
  if (!dbInstance) {
    dbInstance = drizzle(getPool(), { schema })
  }
  return dbInstance
}

// Utility to Generate Zod Schemas from Drizzle Schema
export function createModelSchemas<T extends keyof typeof schema>(tableName: T) {
  const table = schema[tableName]

  return {
    insert: createInsertSchema(table),
    select: createSelectSchema(table),
    update: createUpdateSchema(table),
    delete: createUpdateSchema(table),
  }
}

export const db = getDbInstance()
