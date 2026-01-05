import { db } from "@/db"
import { products } from "@/db/schema/products"
import type { NewQrCode, QrCode } from "@/db/schema/qr-codes"
import { qrCodes } from "@/db/schema/qr-codes"
import { and, desc, eq, ilike, sql } from "drizzle-orm"
import { companies } from "../schema/companies"
import { BaseRepository } from "./base-repository"

export interface QrCodeWithProduct extends QrCode {
  product?: {
    id: string
    name: string
    companyId: string
  }
}

export class QrCodesRepository extends BaseRepository<QrCode | NewQrCode | null> {
  tableName = 'qr_codes'

  async create(data: NewQrCode): Promise<QrCode | null> {
    try {
      const [qrCode] = await db
        .insert(qrCodes)
        .values({
          ...data,
          updatedAt: new Date(),
        })
        .returning()

      return qrCode
    } catch (error) {
      this.handleError('create', error)
    }
  }

  async findById(id: string): Promise<QrCode | null> {
    try {
      const [qrCode] = await db
        .select()
        .from(qrCodes)
        .where(and(eq(qrCodes.id, id), eq(qrCodes.isDeleted, false)))
        .limit(1)

      return qrCode || null
    } catch (error) {
      this.handleError('findById', error)
    }
  }

  async findByProduct(productId: string): Promise<QrCode | null> {
    try {
      const [qrCode] = await db
        .select()
        .from(qrCodes)
        .where(and(eq(qrCodes.productId, productId), eq(qrCodes.isDeleted, false)))
        .limit(1)

      return qrCode || null
    } catch (error) {
      this.handleError('findByProduct', error)
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      const [deleted] = await db
        .update(qrCodes)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(qrCodes.id, id))
        .returning()

      return !!deleted
    } catch (error) {
      this.handleError('softDelete', error)
      return false
    }
  }

  /**
   * Generate and assign a QR code to a product
   */
  async generateQrCodeForProduct(productId: string, qrCodeImageUrl: string): Promise<QrCode | null> {
    try {
      return await db.transaction(async (tx) => {
        // Get product details
        const [product] = await tx.select().from(products).where(eq(products.id, productId)).limit(1)

        if (!product) {
          throw new Error('Product not found')
        }

        if (product.qrCodeId) {
          throw new Error('Product already has a QR code assigned')
        }

        // Create QR code record
        const [newQrCode] = await tx
          .insert(qrCodes)
          .values({
            productId,
            qrCodeImageUrl,
            updatedAt: new Date(),
          })
          .returning()

        // Link QR code to product
        await tx
          .update(products)
          .set({
            qrCodeId: newQrCode.id,
            updatedAt: new Date(),
          })
          .where(eq(products.id, productId))

        return newQrCode
      })
    } catch (error) {
      console.log("error", error)
      this.handleError('generateQrCodeForProduct', error)
    }
  }

  async findByCompany(companyId: string): Promise<QrCodeWithProduct[]> {
    try {
      const results = await db
        .select({
          qrCode: qrCodes,
          product: {
            id: products.id,
            name: products.name,
            companyId: products.companyId,
          },
        })
        .from(qrCodes)
        .innerJoin(products, eq(qrCodes.productId, products.id))
        .where(and(eq(products.companyId, companyId), eq(qrCodes.isDeleted, false)))
        .orderBy(qrCodes.createdAt)

      return results.map((result) => ({
        ...result.qrCode,
        product: result.product,
      }))
    } catch (error) {
      this.handleError('findByCompany', error)
    }
  }
  async findAll(): Promise<QrCode[]> {
    try {
      return await db.select().from(qrCodes).where(eq(qrCodes.isDeleted, false)).orderBy(qrCodes.createdAt)
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  async update(id: string, entity: Partial<NewQrCode>): Promise<QrCode | null> {
    try {
      const [updated] = await db
        .update(qrCodes)
        .set({
          ...entity,
          updatedAt: new Date(),
        })
        .where(eq(qrCodes.id, id))
        .returning()

      return updated || null
    } catch (error) {
      this.handleError('update', error)
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
    data: QrCodeWithProduct[]
    total: number
  }> {
    try {
      const offset = (page - 1) * limit

      // Build where conditions
      const conditions = [eq(qrCodes.isDeleted, false)]

      // Apply search filter if provided
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`
        const searchCondition = sql`(
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
          qrCode: qrCodes,
          product: {
            id: products.id,
            name: products.name,
            companyId: products.companyId,
            description: products.description,
          },
        })
        .from(qrCodes)
        .innerJoin(products, eq(qrCodes.productId, products.id))
        .innerJoin(companies, eq(products.companyId, companies.id))
        .where(whereCondition)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(qrCodes.createdAt))

      // Base query for count
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(qrCodes)
        .innerJoin(products, eq(qrCodes.productId, products.id))
        .innerJoin(companies, eq(products.companyId, companies.id))
        .where(whereCondition)

      const [data, [{ count }]] = await Promise.all([dataQuery, countQuery])

      const results: QrCodeWithProduct[] = data.map((result) => ({
        ...result.qrCode,
        product: result.product,
      }))

      return {
        data: results,
        total: count || 0,
      }
    } catch (error) {
      this.handleError("getPaginated", error)
      return { data: [], total: 0 }
    }
  }

  async incrementScanCount(id: string): Promise<QrCode | null> {
    try {
      const [updated] = await db
        .update(qrCodes)
        .set({
          scanCount: sql`${qrCodes.scanCount} + 1`,
          lastScannedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(qrCodes.id, id))
        .returning()

      return updated || null
    } catch (error) {
      this.handleError("incrementScanCount", error)
    }
  }

  async getScanAnalytics(companyId?: string): Promise<{
    totalScans: number
    totalQRCodes: number
    averageScansPerQR: number
    topScannedQRCodes: Array<{
      id: string
      productName: string
      scanCount: number
      lastScannedAt: string | null
    }>
  }> {
    try {
      // Get total scans and QR codes count
      const [totals] = await db
        .select({
          totalScans: sql<number>`sum(${qrCodes.scanCount})`,
          totalQRCodes: sql<number>`count(*)`,
        })
        .from(qrCodes)
        .leftJoin(products, eq(qrCodes.productId, products.id))
        .where(and(eq(qrCodes.isDeleted, false), companyId ? eq(products.companyId, companyId) : sql`TRUE`))

      // Get top scanned QR codes
      const topScanned = await db
        .select({
          id: qrCodes.id,
          productName: products.name,
          scanCount: qrCodes.scanCount,
          lastScannedAt: qrCodes.lastScannedAt,
        })
        .from(qrCodes)
        .innerJoin(products, eq(qrCodes.productId, products.id))
        .where(and(eq(qrCodes.isDeleted, false), companyId ? eq(products.companyId, companyId) : sql`TRUE`))
        .orderBy(sql`${qrCodes.scanCount} DESC`)
        .limit(10)

      const totalScans = totals?.totalScans || 0
      const totalQRCodes = totals?.totalQRCodes || 0

      return {
        totalScans,
        totalQRCodes,
        averageScansPerQR: totalQRCodes > 0 ? Math.round(totalScans / totalQRCodes) : 0,
        topScannedQRCodes: topScanned.map((item) => ({
          ...item,
          productName: item.productName || "Unknown Product",
          lastScannedAt: item.lastScannedAt?.toISOString() || null,
        })),
      }
    } catch (error) {
      this.handleError("getScanAnalytics", error)
      return {
        totalScans: 0,
        totalQRCodes: 0,
        averageScansPerQR: 0,
        topScannedQRCodes: [],
      }
    }
  }
}

export const qrCodesRepository = new QrCodesRepository()
