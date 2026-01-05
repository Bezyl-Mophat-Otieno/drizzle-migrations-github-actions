import { db } from "@/db"
import type { Barcode, NewBarcode } from "@/db/schema/barcodes"
import { barcodes } from "@/db/schema/barcodes"
import { Product, products } from "@/db/schema/products"
import { type UpiPrefix, upiPrefixes } from "@/db/schema/upi-prefixes"
import { and, desc, eq, ilike, sql } from "drizzle-orm"
import { BarcodeGenerator } from "../../lib/services/generation/utils/barcode-generator"
import { calculateChecksumDigit } from "../../lib/services/generation/utils/checksum"
import { companies } from "../schema/companies"
import { QrCode, qrCodes } from "../schema/qr-codes"
import { BaseRepository } from "./base-repository"

export interface BarcodeWithDetails extends Barcode {
  product?: {
    id: string
    name: string
    companyId: string
    description: string | null
  }
  upiPrefix?: {
    id: string
    prefix: string
    type: string
  }
}

export class BarcodesRepository extends BaseRepository<Barcode | NewBarcode | undefined> {
  tableName = "barcodes"

  async create(data: NewBarcode): Promise<Barcode | undefined> {
    try {
      const [barcode] = await db
        .insert(barcodes)
        .values({
          ...data,
          updatedAt: new Date(),
        })
        .returning()

      return barcode
    } catch (error) {
      console.log(error)
      this.handleError("create", error)
    }
  }

  async findById(id: string): Promise<Barcode | undefined> {
    try {
      const [barcode] = await db
        .select()
        .from(barcodes)
        .where(and(eq(barcodes.id, id), eq(barcodes.isDeleted, false)))
        .limit(1)

      return barcode
    } catch (error) {
      this.handleError("findById", error)
    }
  }

  async findByBarcodeNumber(barcodeNumber: string): Promise<{barcode: Barcode, product: Product, upiPrefix: UpiPrefix, qrcode: QrCode | null} | undefined> {
    try {
      const [result] = await db
        .select({
          barcode: barcodes,
          product: products,
          upiPrefix: upiPrefixes,
          qrcode: qrCodes
        })
        .from(barcodes)
        .innerJoin(products, eq(barcodes.productId, products.id))
        .innerJoin(upiPrefixes, eq(barcodes.upiPrefixId, upiPrefixes.id))
        .leftJoin(qrCodes, eq(qrCodes.productId, products.id))
        .where(and(eq(barcodes.barcodeNumber, barcodeNumber), eq(barcodes.isDeleted, false)))
        .limit(1)

      if (!result) return undefined

      return result
    } catch (error) {
      this.handleError("findByBarcodeNumber", error)
    }
  }

  async findByProduct(productId: string): Promise<Barcode | null> {
    try {
      const [barcode] = await db
        .select()
        .from(barcodes)
        .where(and(eq(barcodes.productId, productId), eq(barcodes.isDeleted, false)))
        .limit(1)

      return barcode || null
    } catch (error) {
      this.handleError("findByProduct", error)
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      const [deleted] = await db
        .update(barcodes)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(barcodes.id, id))
        .returning()

      return !!deleted
    } catch (error) {
      this.handleError("softDelete", error)
      return false
    }
  }

  /**
   * Generate a barcode for a product using the company's active UPI prefix
   */
  async generateBarcodeForProduct(productId: string): Promise<(Barcode & { activePrefix: UpiPrefix }) | null> {
    try {
      return await db.transaction(async (tx) => {
        // Get product details
        const [product] = await tx.select().from(products).where(eq(products.id, productId)).limit(1)

        if (!product) {
          throw new Error("Product not found")
        }

        if (product.barcodeId) {
          throw new Error("Product already has a barcode assigned")
        }

        // Get active UPI prefix for the company
        const [activePrefix] = await tx
          .select()
          .from(upiPrefixes)
          .where(and(eq(upiPrefixes.companyId, product.companyId), eq(upiPrefixes.isActive, true)))
          .limit(1)

        if (!activePrefix) {
          throw new Error("No active UPI prefix found for company")
        }

        // Validate capacity
        if (activePrefix.usedCount >= activePrefix.maxProducts) {
          throw new Error("UPI prefix has reached maximum capacity")
        }

        // Generate barcode string
        const sequenceNumber = activePrefix.nextSequenceNumber
        const { paddedSequenceNumber, baseCode } = BarcodeGenerator.buildBarcodeString(
          activePrefix.prefix,
          sequenceNumber,
          activePrefix.type,
        )

        // Calculate checksum and create final barcode
        const checksum = calculateChecksumDigit(baseCode)
        const fullBarcode = baseCode + checksum

        // Create barcode record
        const [newBarcode] = await tx
          .insert(barcodes)
          .values({
            productId,
            upiPrefixId: activePrefix.id,
            sequenceNumber: paddedSequenceNumber,
            barcodeNumber: fullBarcode,
            updatedAt: new Date(),
          })
          .returning()

        // Update UPI prefix counters
        await tx
          .update(upiPrefixes)
          .set({
            usedCount: activePrefix.usedCount + 1,
            nextSequenceNumber: activePrefix.nextSequenceNumber + 1,
            updatedAt: new Date(),
          })
          .where(eq(upiPrefixes.id, activePrefix.id))

        // Link barcode to product
        await tx
          .update(products)
          .set({
            barcodeId: newBarcode.id,
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId))

        return { ...newBarcode, activePrefix: activePrefix }
      })
    } catch (error) {
      this.handleError("generateBarcodeForProduct", error)
    }
  }

  async findByCompany(companyId: string): Promise<BarcodeWithDetails[]> {
    try {
      const results = await db
        .select({
          barcode: barcodes,
          product: {
            id: products.id,
            name: products.name,
            companyId: products.companyId,
            description: products.description,
          },
          upiPrefix: {
            id: upiPrefixes.id,
            prefix: upiPrefixes.prefix,
            type: upiPrefixes.type,
          },
        })
        .from(barcodes)
        .innerJoin(products, eq(barcodes.productId, products.id))
        .innerJoin(upiPrefixes, eq(barcodes.upiPrefixId, upiPrefixes.id))
        .where(and(eq(products.companyId, companyId), eq(barcodes.isDeleted, false)))
        .orderBy(barcodes.createdAt)

      return results.map((result) => ({
        ...result.barcode,
        product: result.product,
        upiPrefix: result.upiPrefix,
      }))
    } catch (error) {
      this.handleError("findByCompany", error)
    }
  }

  async getCapacityReport(companyId?: string): Promise<{
    totalBarcodes: number
    activeBarcodes: number
    deletedBarcodes: number
    barcodesByPrefix: Array<{
      prefixId: string
      prefix: string
      type: string
      count: number
    }>
  }> {
    try {
      const [totals] = await db
        .select({
          total: sql<number>`count(*)`,
          active: sql<number>`count(*) filter (where ${barcodes.isDeleted} = false)`,
          deleted: sql<number>`count(*) filter (where ${barcodes.isDeleted} = true)`,
        })
        .from(barcodes)
        .leftJoin(products, eq(barcodes.productId, products.id))
        .where(companyId ? eq(products.companyId, companyId) : sql`TRUE`)

      const prefixBreakdown = await db
        .select({
          prefixId: upiPrefixes.id,
          prefix: upiPrefixes.prefix,
          type: upiPrefixes.type,
          count: sql<number>`count(${barcodes.id})`,
        })
        .from(barcodes)
        .leftJoin(products, eq(barcodes.productId, products.id))
        .innerJoin(upiPrefixes, eq(barcodes.upiPrefixId, upiPrefixes.id))
        .where(and(eq(barcodes.isDeleted, false), companyId ? eq(products.companyId, companyId) : sql`TRUE`))
        .groupBy(upiPrefixes.id, upiPrefixes.prefix, upiPrefixes.type)

      return {
        totalBarcodes: totals?.total || 0,
        activeBarcodes: totals?.active || 0,
        deletedBarcodes: totals?.deleted || 0,
        barcodesByPrefix: prefixBreakdown,
      }
    } catch (error) {
      this.handleError("getCapacityReport", error)
    }
  }

  async update(id: string, entity: Partial<NewBarcode>): Promise<Barcode | undefined> {
    try {
      const [updated] = await db
        .update(barcodes)
        .set({
          ...entity,
          updatedAt: new Date(),
        })
        .where(eq(barcodes.id, id))
        .returning()

      return updated
    } catch (error) {
      this.handleError("update", error)
    }
  }

  async findAll(): Promise<Barcode[]> {
    try {
      return await db.select().from(barcodes).where(eq(barcodes.isDeleted, false)).orderBy(barcodes.createdAt)
    } catch (error) {
      this.handleError("findAll", error)
    }
  }

  async delete(id: string): Promise<boolean> {
    return this.softDelete(id)
  }

  async getPaginated({
    page,
    limit,
    search,
    companyId
  }: {
    page: number
    limit: number
    search?: string
    companyId?: string
  }): Promise<{
    data: BarcodeWithDetails[]
    total: number
  }> {
    try {
      const offset = (page - 1) * limit

      // Build where conditions
      const conditions = [eq(barcodes.isDeleted, false)]

      // Apply search filter if provided
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`
        const searchCondition = sql`(
          ${ilike(barcodes.barcodeNumber, searchTerm)} OR
          ${ilike(products.name, searchTerm)} OR
          ${ilike(products.description, searchTerm)}
        )`
        conditions.push(searchCondition)
      }

      // Apply companyId filter if provided
      if (companyId) {
        const searchTerm = eq(companies.id, companyId)
        conditions.push(searchTerm)
      }

      const whereCondition = and(...conditions)

      // Base query for data
      const dataQuery = db
        .select({
          barcode: barcodes,
          product: {
            id: products.id,
            name: products.name,
            companyId: products.companyId,
            description: products.description,
          },
          upiPrefix: {
            id: upiPrefixes.id,
            prefix: upiPrefixes.prefix,
            type: upiPrefixes.type,
          },
        })
        .from(barcodes)
        .innerJoin(products, eq(barcodes.productId, products.id))
        .innerJoin(companies, eq(products.companyId, companies.id))
        .leftJoin(upiPrefixes, eq(barcodes.upiPrefixId, upiPrefixes.id))
        .where(whereCondition)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(barcodes.createdAt))

      // Base query for count
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(barcodes)
        .innerJoin(products, eq(barcodes.productId, products.id))
        .innerJoin(companies, eq(products.companyId, companies.id))
        .where(whereCondition)

      const [data, [{ count }]] = await Promise.all([dataQuery, countQuery])

      const results: BarcodeWithDetails[] = data.map((result) => ({
        ...result.barcode,
        product: result.product,
        upiPrefix: result.upiPrefix || undefined,
      }))

      return {
        data: results,
        total: count || 0,
      }
    } catch (error) {
      console.log(error)
      this.handleError("getPaginated", error)
    }
  }
}

export const barcodesRepository = new BarcodesRepository()
