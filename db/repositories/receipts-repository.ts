import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm"
import { db } from "../index"
import { transactions } from "../schema/transactions"
import { invoices } from "../schema/invoices"
import { users } from "../schema/auth-users"
import { receipts, type Receipt, type NewReceipt } from "../schema/receipts"
import { BaseRepository } from "./base-repository"

export interface ReceiptFilters {
  invoiceId?: string
  transactionId?: string
  search?: string
  paymentMethod?: string
  startDate?: string
  endDate?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export class ReceiptsRepository extends BaseRepository<Receipt> {
  tableName = "receipts"

  async findAll() {
    return await db
      .select({
        id: receipts.id,
        receiptNumber: receipts.receiptNumber,
        transactionId: receipts.transactionId,
        invoiceId: receipts.invoiceId,
        amount: receipts.amount,
        paymentMethod: receipts.paymentMethod,
        pdfUrl: receipts.pdfUrl,
        emailSentAt: receipts.emailSentAt,
        createdAt: receipts.createdAt,
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
        },
        transaction: {
          id: transactions.id,
          phoneNumber: transactions.phoneNumber,
          mpesaReceiptNumber: transactions.mpesaReceiptNumber,
        },
      })
      .from(receipts)
      .leftJoin(invoices, eq(receipts.invoiceId, invoices.id))
      .leftJoin(transactions, eq(receipts.transactionId, transactions.id))
      .where(eq(receipts.isDeleted, false))
      .orderBy(desc(receipts.createdAt))
  }

  async findPaginated(filters: ReceiptFilters, pagination: PaginationParams) {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = [eq(receipts.isDeleted, false)]

    if (filters.invoiceId) {
      conditions.push(eq(receipts.invoiceId, filters.invoiceId))
    }

    if (filters.transactionId) {
      conditions.push(eq(receipts.transactionId, filters.transactionId))
    }

    if (filters.paymentMethod) {
      conditions.push(eq(receipts.paymentMethod, filters.paymentMethod))
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(receipts.receiptNumber, `%${filters.search}%`),
          ilike(invoices.invoiceNumber, `%${filters.search}%`)
        )!
      )
    }

    if (filters.startDate) {
      conditions.push(sql`${receipts.createdAt} >= ${filters.startDate}`)
    }

    if (filters.endDate) {
      conditions.push(sql`${receipts.createdAt} <= ${filters.endDate}`)
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(receipts)
      .leftJoin(invoices, eq(receipts.invoiceId, invoices.id))
      .where(and(...conditions))

    // Get paginated results
    const items = await db
      .select({
        id: receipts.id,
        receiptNumber: receipts.receiptNumber,
        transactionId: receipts.transactionId,
        invoiceId: receipts.invoiceId,
        amount: receipts.amount,
        paymentMethod: receipts.paymentMethod,
        pdfUrl: receipts.pdfUrl,
        emailSentAt: receipts.emailSentAt,
        createdAt: receipts.createdAt,
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
        },
        transaction: {
          id: transactions.id,
          phoneNumber: transactions.phoneNumber,
          mpesaReceiptNumber: transactions.mpesaReceiptNumber,
        },
      })
      .from(receipts)
      .leftJoin(invoices, eq(receipts.invoiceId, invoices.id))
      .leftJoin(transactions, eq(receipts.transactionId, transactions.id))
      .where(and(...conditions))
      .orderBy(desc(receipts.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      items,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    }
  }

  async findById(id: string) {
    const result = await db
      .select({
        id: receipts.id,
        receiptNumber: receipts.receiptNumber,
        transactionId: receipts.transactionId,
        invoiceId: receipts.invoiceId,
        amount: receipts.amount,
        paymentMethod: receipts.paymentMethod,
        pdfUrl: receipts.pdfUrl,
        pdfKey: receipts.pdfKey,
        emailSentAt: receipts.emailSentAt,
        emailSentTo: receipts.emailSentTo,
        notes: receipts.notes,
        metadata: receipts.metadata,
        createdAt: receipts.createdAt,
        updatedAt: receipts.updatedAt,
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          totalAmount: invoices.totalAmount,
        },
        transaction: {
          id: transactions.id,
          phoneNumber: transactions.phoneNumber,
          mpesaReceiptNumber: transactions.mpesaReceiptNumber,
        },
      })
      .from(receipts)
      .leftJoin(invoices, eq(receipts.invoiceId, invoices.id))
      .leftJoin(transactions, eq(receipts.transactionId, transactions.id))
      .where(and(eq(receipts.id, id), eq(receipts.isDeleted, false)))

    return result[0] || null
  }

  async findByReceiptNumber(receiptNumber: string) {
    const result = await db
      .select()
      .from(receipts)
      .where(and(eq(receipts.receiptNumber, receiptNumber), eq(receipts.isDeleted, false)))

    return result[0] || null
  }

  async findByTransactionId(transactionId: string) {
    const result = await db
      .select()
      .from(receipts)
      .where(and(eq(receipts.transactionId, transactionId), eq(receipts.isDeleted, false)))

    return result[0] || null
  }

  async create(data: NewReceipt) {
    const result = await db.insert(receipts).values(data).returning()
    return result[0]
  }

  async update(id: string, data: Partial<Receipt>) {
    const result = await db
      .update(receipts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(receipts.id, id))
      .returning()
    return result[0] || null
  }

  async setPdfInfo(id: string, pdfUrl: string, pdfKey: string) {
    return await this.update(id, {
      pdfUrl,
      pdfKey,
    })
  }

  async setEmailSent(id: string, emailSentTo: string) {
    return await this.update(id, {
      emailSentAt: new Date(),
      emailSentTo,
    })
  }

  async softDelete(id: string, deletedBy: string) {
    const result = await db
      .update(receipts)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(receipts.id, id))
      .returning()
    return result[0] || null
  }

  async delete(id: string) {
    const result = await db.delete(receipts).where(eq(receipts.id, id)).returning()
    return result.length > 0
  }

  async getNextReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `RCP-${year}-`

    const result = await db
      .select({ receiptNumber: receipts.receiptNumber })
      .from(receipts)
      .where(ilike(receipts.receiptNumber, `${prefix}%`))
      .orderBy(desc(receipts.receiptNumber))
      .limit(1)

    if (result.length === 0) {
      return `${prefix}0001`
    }

    const lastNumber = result[0].receiptNumber.split("-").pop()
    const nextNumber = Number.parseInt(lastNumber || "0", 10) + 1

    return `${prefix}${nextNumber.toString().padStart(4, "0")}`
  }
}

export const receiptsRepository = new ReceiptsRepository()
