import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { products } from './products'
import { upiPrefixes } from './upi-prefixes'

export const barcodes = pgTable('ptl_barcodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  upiPrefixId: uuid('upi_prefix_id')
    .references(() => upiPrefixes.id, { onDelete: 'cascade' }),
  barcodeImageUrl: text('barcode_image_url'),
  sequenceNumber: varchar('sequence_number', { length: 10 }).notNull(),
  barcodeNumber: varchar('barcode_number', { length: 15 }).notNull().unique(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Barcode = typeof barcodes.$inferSelect
export type NewBarcode = typeof barcodes.$inferInsert
