import { db } from "@/db"
import { type NewProduct, type Product, products } from "@/db/schema/products"
import type { ProductSearchFilters, ProductWithIdentifiers } from "@/types/product"
import { and, count, desc, eq, ilike, isNotNull, isNull, sql } from "drizzle-orm"
import { barcodes } from "../schema/barcodes"
import { qrCodes } from "../schema/qr-codes"
import { BaseRepository } from "./base-repository"

export interface ProductFilterOptions {
  name?: string
  companyId?: string
  hasBarcode?: "true" | "false"
  hasQRCode?: "true" | "false"
  hasImage?: "has_image" | "no_image"
  page?: number
  limit?: number
}

export class ProductRepository extends BaseRepository<Product | NewProduct | undefined> {
  tableName = "products"

  async create(data: NewProduct): Promise<Product | undefined> {
    try {
      const [product] = await db
        .insert(products)
        .values({
          ...data,
          updatedAt: new Date(),
        })
        .returning()

      return product
    } catch (error) {
      console.log(error)
      this.handleError("create", error)
    }
  }

  async findById(id: string): Promise<Product | undefined> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1)
      return product
    } catch (error) {
      this.handleError("findById", error)
    }
  }

  async update(id: string, data: Partial<Product>): Promise<Product | undefined> {
    try {
      const [product] = await db
        .update(products)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning()

      return product
    } catch (error) {
      this.handleError("update", error)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(products).where(eq(products.id, id)).returning()
      return !!deleted
    } catch (error) {
      this.handleError("delete", error)
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      const [deleted] = await db
        .update(products)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning()

      return !!deleted
    } catch (error) {
      this.handleError("softDelete", error)
      return false
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      return await db.select().from(products).orderBy(products.createdAt)
    } catch (error) {
      this.handleError("findAll", error)
    }
  }

  async findByCompany(companyId: string): Promise<ProductWithIdentifiers[]> {
    try {
      const result = await db
        .select({
          product: products,
          barcode: {
            id: barcodes.id,
            barcodeNumber: barcodes.barcodeNumber,
            barcodeImageUrl: barcodes.barcodeImageUrl,
          },
          qrCode: {
            id: qrCodes.id,
            qrCodeImageUrl: qrCodes.qrCodeImageUrl,
          },
        })
        .from(products)
        .leftJoin(barcodes, eq(products.barcodeId, barcodes.id))
        .leftJoin(qrCodes, eq(products.qrCodeId, qrCodes.id))
        .where(eq(products.companyId, companyId))
        .orderBy(desc(products.createdAt))

      return result.map((item) => ({
        ...item.product,
        hasBarcode: item.product.barcodeId !== null,
        hasQRCode: item.product.qrCodeId !== null,
        barcodeImageUrl: item.barcode?.barcodeImageUrl || null,
        qrCodeImageUrl: item.qrCode?.qrCodeImageUrl || null,
        barcode: item.barcode?.id
          ? {
              id: item.barcode.id,
              barcodeNumber: item.barcode.barcodeNumber,
              barcodeImageUrl: item.barcode.barcodeImageUrl,
            }
          : null,
        qrCode: item.qrCode?.id
          ? {
              id: item.qrCode.id,
              qrCodeImageUrl: item.qrCode.qrCodeImageUrl,
            }
          : null,
      }))
    } catch (error) {
      this.handleError("findByCompany", error)
    }
  }

  async assignIdentifiers(productId: string, barcodeId?: string, qrCodeId?: string): Promise<Product | undefined> {
    try {
      const existingProduct = await this.findById(productId)
      if (!existingProduct) throw new Error("Product not found")

      if (barcodeId && existingProduct.barcodeId) throw new Error("Product already has a barcode assigned")
      if (qrCodeId && existingProduct.qrCodeId) throw new Error("Product already has a QR code assigned")

      const updateData: Partial<NewProduct> = {
        ...(barcodeId && { barcodeId }),
        ...(qrCodeId && { qrCodeId }),
      }

      const [product] = await db.update(products).set(updateData).where(eq(products.id, productId)).returning()

      return product
    } catch (error) {
      this.handleError("assignIdentifiers", error)
    }
  }

  async search(filters: ProductSearchFilters): Promise<ProductWithIdentifiers[]> {
    try {
      const conditions = [
        filters.name ? ilike(products.name, `%${filters.name}%`) : undefined,
        filters.countryOfIssue ? eq(products.countryOfSale, filters.countryOfIssue as any) : undefined,
        filters.color ? eq(products.color, filters.color) : undefined,
        filters.size ? eq(products.size, filters.size) : undefined,
        filters.companyId ? eq(products.companyId, filters.companyId) : undefined,
      ].filter(Boolean) as (ReturnType<typeof eq> | ReturnType<typeof ilike>)[]

      const result = await db
        .select({
          product: products,
          barcode: {
            id: barcodes.id,
            barcodeNumber: barcodes.barcodeNumber,
            barcodeImageUrl: barcodes.barcodeImageUrl,
          },
          qrCode: {
            id: qrCodes.id,
            qrCodeImageUrl: qrCodes.qrCodeImageUrl,
          },
        })
        .from(products)
        .leftJoin(barcodes, eq(products.barcodeId, barcodes.id))
        .leftJoin(qrCodes, eq(products.qrCodeId, qrCodes.id))
        .where(conditions.length ? and(...conditions) : sql`TRUE`)
        .orderBy(desc(products.createdAt))

      return result.map((item) => ({
        ...item.product,
        hasBarcode: item.product.barcodeId !== null,
        hasQRCode: item.product.qrCodeId !== null,
        barcodeImageUrl: item.barcode?.barcodeImageUrl || null,
        qrCodeImageUrl: item.qrCode?.qrCodeImageUrl || null,
        barcode: item.barcode?.id
          ? {
              id: item.barcode.id,
              barcodeNumber: item.barcode.barcodeNumber,
              barcodeImageUrl: item.barcode.barcodeImageUrl,
            }
          : null,
        qrCode: item.qrCode?.id
          ? {
              id: item.qrCode.id,
              qrCodeImageUrl: item.qrCode.qrCodeImageUrl,
            }
          : null,
      }))
    } catch (error) {
      this.handleError("search", error)
    }
  }

  async findWithoutBarcodes(companyId?: string): Promise<Product[]> {
    try {
      const results = await db
        .select()
        .from(products)
        .where(
          companyId ? and(isNull(products.barcodeId), eq(products.companyId, companyId)) : isNull(products.barcodeId),
        )
        .orderBy(desc(products.createdAt))

      return results
    } catch (error) {
      this.handleError("findWithoutBarcodes", error)
    }
  }

  async findWithoutQRCodes(companyId?: string): Promise<Product[]> {
    try {
      const results = await db
        .select()
        .from(products)
        .where(
          companyId ? and(isNull(products.qrCodeId), eq(products.companyId, companyId)) : isNull(products.qrCodeId),
        )
        .orderBy(desc(products.createdAt))

      return results
    } catch (error) {
      this.handleError("findWithoutQRCodes", error)
    }
  }

  async findAllPaginated(
    page = 1,
    limit = 50,
    companyId?: string,
    searchTerm?: string
  ): Promise<{ products: ProductWithIdentifiers[]; total: number }> {
    try {
      const offset = (page - 1) * limit

      const [productsResult, totalResult] = await Promise.all([
        db
          .select({
            product: products,
            barcode: {
              id: barcodes.id,
              barcodeNumber: barcodes.barcodeNumber,
              barcodeImageUrl: barcodes.barcodeImageUrl,
            },
            qrCode: {
              id: qrCodes.id,
              qrCodeImageUrl: qrCodes.qrCodeImageUrl,
            },
          })
          .from(products)
          .leftJoin(barcodes, eq(products.barcodeId, barcodes.id))
          .leftJoin(qrCodes, eq(products.qrCodeId, qrCodes.id))
          .where(
            and(
              searchTerm ? ilike(products.name, `%${searchTerm}%`) : undefined,
              companyId ? eq(products.companyId, companyId) : undefined,
              eq(products.isDeleted, false),
            ),
          ).orderBy(desc(products.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: products.id }).from(products).where(
          and(
              searchTerm ? ilike(products.name, `%${searchTerm}%`) : undefined,
              companyId ? eq(products.companyId, companyId) : undefined,
              eq(products.isDeleted, false),
            ),),
      ])

      return {
        products: productsResult.map((result) => ({
          ...result.product,
          hasBarcode: result.product.barcodeId !== null,
          hasQRCode: result.product.qrCodeId !== null,
          barcodeImageUrl: result.barcode?.barcodeImageUrl || null,
          qrCodeImageUrl: result.qrCode?.qrCodeImageUrl || null,
          barcode: result.barcode?.id
            ? {
                id: result.barcode.id,
                barcodeNumber: result.barcode.barcodeNumber,
                barcodeImageUrl: result.barcode.barcodeImageUrl,
              }
            : null,
          qrCode: result.qrCode?.id
            ? {
                id: result.qrCode.id,
                qrCodeImageUrl: result.qrCode.qrCodeImageUrl,
              }
            : null,
        })),
        total: totalResult.length,
      }
    } catch (error) {
      this.handleError("findAllPaginated", error)
    }
  }

    async findAllToExport(
    companyId?: string,
  ): Promise<{ products: ProductWithIdentifiers[] }> {
    try {
      const [productsResult] = await Promise.all([
        db
          .select({
            product: products,
            barcode: {
              id: barcodes.id,
              barcodeNumber: barcodes.barcodeNumber,
              barcodeImageUrl: barcodes.barcodeImageUrl,
            },
            qrCode: {
              id: qrCodes.id,
              qrCodeImageUrl: qrCodes.qrCodeImageUrl,
            },
          })
          .from(products)
          .leftJoin(barcodes, eq(products.barcodeId, barcodes.id))
          .leftJoin(qrCodes, eq(products.qrCodeId, qrCodes.id))
          .where(companyId && companyId !== "all" ? and(eq(products.isDeleted, false), eq(products.companyId, companyId)) : sql`TRUE`)
        .orderBy(desc(products.createdAt)),
      ])

      return {
        products: productsResult.map((result) => ({
          ...result.product,
          hasBarcode: result.product.barcodeId !== null,
          hasQRCode: result.product.qrCodeId !== null,
          barcodeImageUrl: result.barcode?.barcodeImageUrl || null,
          qrCodeImageUrl: result.qrCode?.qrCodeImageUrl || null,
          barcode: result.barcode?.id
            ? {
                id: result.barcode.id,
                barcodeNumber: result.barcode.barcodeNumber,
                barcodeImageUrl: result.barcode.barcodeImageUrl,
              }
            : null,
          qrCode: result.qrCode?.id
            ? {
                id: result.qrCode.id,
                qrCodeImageUrl: result.qrCode.qrCodeImageUrl,
              }
            : null,
        })),
      }
    } catch (error) {
      this.handleError("findAllPaginated", error)
    }
  }

  async findAllPaginatedWithFilters(
    options: ProductFilterOptions,
  ): Promise<{ products: ProductWithIdentifiers[]; total: number,  totalWithBarcodes: number, totalWithQrcodes: number, totalComplete: number}> {
    try {
      const { name, companyId, hasBarcode, hasQRCode, hasImage, page = 1, limit = 50 } = options
      const offset = (page - 1) * limit

      // Build conditions array
      const conditions = [eq(products.isDeleted, false)]

      if (companyId && companyId !== "all") {
        conditions.push(eq(products.companyId, companyId))
      }

      if (name) {
        conditions.push(ilike(products.name, `%${name}%`))
      }

      if (hasBarcode === "true") {
        conditions.push(isNotNull(products.barcodeId))
      } else if (hasBarcode === "false") {
        conditions.push(isNull(products.barcodeId))
      }

      if (hasQRCode === "true") {
        conditions.push(isNotNull(products.qrCodeId))
      } else if (hasQRCode === "false") {
        conditions.push(isNull(products.qrCodeId))
      }

      if (hasImage === "has_image") {
        conditions.push(isNotNull(products.imageUrl))
      } else if (hasImage === "no_image") {
        conditions.push(isNull(products.imageUrl))
      }

      const whereClause = and(...conditions)

      const [productsResult, totalResult, totalWithBarcodes, totalWithQrcodes, totalComplete] = await Promise.all([
        db
          .select({
            product: products,
            barcode: {
              id: barcodes.id,
              barcodeNumber: barcodes.barcodeNumber,
              barcodeImageUrl: barcodes.barcodeImageUrl,
            },
            qrCode: {
              id: qrCodes.id,
              qrCodeImageUrl: qrCodes.qrCodeImageUrl,
            },
          })
          .from(products)
          .leftJoin(barcodes, eq(products.barcodeId, barcodes.id))
          .leftJoin(qrCodes, eq(products.qrCodeId, qrCodes.id))
          .where(whereClause)
          .orderBy(desc(products.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(products).where(whereClause),
        db.select({ count: count() }).from(products).where(and(isNotNull(products.barcodeId), whereClause)),
        db.select({ count: count() }).from(products).where(and(isNotNull(products.qrCodeId), whereClause)),
        db.select({ count: count() }).from(products).where(and(isNotNull(products.barcodeId), isNotNull(products.qrCodeId), whereClause)),
      ])

      return {
        products: productsResult.map((result) => ({
          ...result.product,
          hasBarcode: result.product.barcodeId !== null,
          hasQRCode: result.product.qrCodeId !== null,
          barcodeImageUrl: result.barcode?.barcodeImageUrl || null,
          qrCodeImageUrl: result.qrCode?.qrCodeImageUrl || null,
          barcode: result.barcode?.id
            ? {
                id: result.barcode.id,
                barcodeNumber: result.barcode.barcodeNumber,
                barcodeImageUrl: result.barcode.barcodeImageUrl,
              }
            : null,
          qrCode: result.qrCode?.id
            ? {
                id: result.qrCode.id,
                qrCodeImageUrl: result.qrCode.qrCodeImageUrl,
              }
            : null,
        })),
        total: totalResult[0]?.count || 0,
        totalWithBarcodes: totalWithBarcodes[0]?.count || 0,
        totalWithQrcodes: totalWithQrcodes[0]?.count || 0,
        totalComplete: totalComplete[0]?.count || 0,
      }
    } catch (error) {
      this.handleError("findAllPaginatedWithFilters", error)
    }
  }
}

export const productRepository = new ProductRepository()
