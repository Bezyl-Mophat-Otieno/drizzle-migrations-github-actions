import { boolean, decimal, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { COUNTRIES, UNITS_OF_MEASUREMENT } from '../../types/product'
import { companies } from './companies'

export const productsStatusEnum = pgEnum('ptl_product_status', ['in-production', 'out-production'])
export const unitOfMeasurementEnum = pgEnum('ptl_unit_of_measurement', UNITS_OF_MEASUREMENT)
export const countryOfSaleEnum = pgEnum('ptl_country_of_sale', COUNTRIES)

export const products = pgTable('ptl_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  barcodeId: uuid('barcode_id'), // FK to barcodes.id, nullable
  qrCodeId: uuid('qr_code_id'), // FK to qr_codes.id, nullable

  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  unitOfMeasurement: unitOfMeasurementEnum('unit_of_measurement').default("kg").notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  netWeight: decimal('net_weight', { precision: 10, scale: 3 }).notNull(),
  countryOfSale: countryOfSaleEnum('country_of_sale').default("Kenya").notNull(),
  size: varchar('size', { length: 100 }),
  color: varchar('color', { length: 50 }),
  imageUrl: text('image_url'),
  status: productsStatusEnum('status').default('in-production').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ProductStatusEnum = (typeof productsStatusEnum.enumValues)[number]



