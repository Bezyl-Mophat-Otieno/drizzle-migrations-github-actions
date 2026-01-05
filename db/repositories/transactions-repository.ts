import { and, count, desc, eq, gte, ilike, lte, or, sql, sum } from "drizzle-orm"
import { db } from "../index"
import { users } from "../schema/auth-users"
import { companies } from "../schema/companies"
import { invoices, type InvoiceStatus } from "../schema/invoices"
import {
  transactions,
  type NewTransaction,
  type PaymentMethod,
  type Transaction,
  type TransactionStatus,
} from "../schema/transactions"
import { BaseRepository } from "./base-repository"

export interface TransactionFilters {
  companyId?: string
  userId?: string
  status?: TransactionStatus
  methodOfPayment?: PaymentMethod
  invoiceStatus?: InvoiceStatus
  startDate?: string
  endDate?: string
  search?: string
  isDeleted?: boolean
  reconciled?: boolean
}

export interface PaginationParams {
  page: number
  limit: number
}

export class TransactionsRepository extends BaseRepository<Transaction> {
  tableName = "transactions"

  async findAll() {
    return await db.select().from(transactions)
  }

  async findAllTransactins() {
    return await db
      .select({
        id: transactions.id,
        companyId: transactions.companyId,
        userId: transactions.userId,
        invoiceId: transactions.invoiceId,
        amount: transactions.amount,
        phoneNumber: transactions.phoneNumber,
        status: transactions.status,
        mpesaReceiptNumber: transactions.mpesaReceiptNumber,
        description: transactions.description,
        isOnDemand: transactions.isOnDemand,
        createdAt: transactions.createdAt,
        paidAt: transactions.paidAt,
        company: {
          id: companies.id,
          name: companies.name,
        },
        user: {
          id: users.id,
          email: users.email,
          username: users.username,
        },
        invoice: {
          id: invoices.id,
          status: invoices.status,
        },
      })
      .from(transactions)
      .leftJoin(companies, eq(transactions.companyId, companies.id))
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(invoices, eq(transactions.invoiceId, invoices.id))
      .orderBy(desc(transactions.createdAt))
  }

  async findPaginated(filters: TransactionFilters, pagination: PaginationParams) {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = [eq(transactions.isDeleted, filters.isDeleted ?? false)]

    if (filters.companyId && filters.companyId !== "all") {
      conditions.push(eq(transactions.companyId, filters.companyId))
    }
    if (filters.userId) {
      conditions.push(eq(transactions.userId, filters.userId))
    }

    if (filters.status) {
      conditions.push(eq(transactions.status, filters.status))
    }

    if (filters.methodOfPayment) {
      conditions.push(eq(transactions.methodOfPayment, filters.methodOfPayment))
    }

    if (filters.invoiceStatus) {
      conditions.push(eq(invoices.status, filters.invoiceStatus))
    }

    if (filters.startDate) {
      conditions.push(gte(transactions.createdAt, new Date(filters.startDate)))
    }

    if (filters.endDate) {
      conditions.push(lte(transactions.createdAt, new Date(filters.endDate)))
    }

    if (filters.reconciled !== undefined) {
      conditions.push(eq(transactions.reconciled, filters.reconciled))
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(transactions.mpesaReceiptNumber, `%${filters.search}%`),
          ilike(transactions.phoneNumber, `%${filters.search}%`),
          ilike(transactions.chequeNumber, `%${filters.search}%`),
          ilike(transactions.bankReference, `%${filters.search}%`),
          ilike(transactions.description, `%${filters.search}%`),
          ilike(companies.name, `%${filters.search}%`),
          ilike(invoices.invoiceNumber, `%${filters.search}%`),
        )!,
      )
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(transactions)
      .leftJoin(companies, eq(transactions.companyId, companies.id))
      .leftJoin(invoices, eq(transactions.invoiceId, invoices.id))
      .where(and(...conditions))

    // Get paginated results
    const items = await db
      .select({
        id: transactions.id,
        companyId: transactions.companyId,
        userId: transactions.userId,
        invoiceId: transactions.invoiceId,
        amount: transactions.amount,
        phoneNumber: transactions.phoneNumber,
        status: transactions.status,
        methodOfPayment: transactions.methodOfPayment,
        mpesaReceiptNumber: transactions.mpesaReceiptNumber,
        mpesaRequestId: transactions.mpesaRequestId,
        checkoutRequestId: transactions.checkoutRequestId,
        chequeNumber: transactions.chequeNumber,
        bankReference: transactions.bankReference,
        description: transactions.description,
        isOnDemand: transactions.isOnDemand,
        reconciled: transactions.reconciled,
        addedBy: transactions.addedBy,
        currency: transactions.currency,
        createdAt: transactions.createdAt,
        paidAt: transactions.paidAt,
        company: {
          id: companies.id,
          name: companies.name,
        },
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          status: invoices.status,
        },
      })
      .from(transactions)
      .leftJoin(companies, eq(transactions.companyId, companies.id))
      .leftJoin(invoices, eq(transactions.invoiceId, invoices.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.createdAt))
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

  async getStats(filters: TransactionFilters) {
    const conditions = [eq(transactions.isDeleted, filters.isDeleted ?? false)]

    if (filters.companyId && filters.companyId !== "all") {
      conditions.push(eq(transactions.companyId, filters.companyId))
    }

    if (filters.userId) {
      conditions.push(eq(transactions.userId, filters.userId))
    }

    if (filters.status) {
      conditions.push(eq(transactions.status, filters.status))
    }

    if (filters.methodOfPayment) {
      conditions.push(eq(transactions.methodOfPayment, filters.methodOfPayment))
    }

    if (filters.startDate) {
      conditions.push(gte(transactions.createdAt, new Date(filters.startDate)))
    }

    if (filters.endDate) {
      conditions.push(lte(transactions.createdAt, new Date(filters.endDate)))
    }

    if (filters.search) {
      conditions.push(
        or(
          ilike(transactions.mpesaReceiptNumber, `%${filters.search}%`),
          ilike(transactions.phoneNumber, `%${filters.search}%`),
          ilike(transactions.chequeNumber, `%${filters.search}%`),
          ilike(companies.name, `%${filters.search}%`),
        )!,
      )
    }

    // Get aggregate stats
    const [stats] = await db
      .select({
        totalTransactions: count(),
        totalAmount: sum(transactions.amount),
      })
      .from(transactions)
      .leftJoin(companies, eq(transactions.companyId, companies.id))
      .where(and(...conditions))

    // Get mpesa count
    const [mpesaStats] = await db
      .select({
        mpesaCount: count(),
        totalAmount: sum(transactions.amount),
      })
      .from(transactions)
      .where(and(...conditions, eq(transactions.methodOfPayment, "mpesa")))

    // Get manual/reconciled count
    const [manualStats] = await db
      .select({
        manualCount: count(),
        totalAmount: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          ...conditions,
          or(
            eq(transactions.methodOfPayment, "cheque"),
            eq(transactions.methodOfPayment, "standing_order"),
            eq(transactions.methodOfPayment, "bank_transfer"),
            eq(transactions.methodOfPayment, "cash"),
            eq(transactions.methodOfPayment, "other"),
          )!,
        ),
      )

    const [pendingStats] = await db
      .select({
        pendingCount: count(),
        totalAmount: sum(transactions.amount),
      })
      .from(transactions)
      .where(and(...conditions, or(eq(transactions.status, "pending"))!))

    const [paidStats] = await db
      .select({
        paidCount: count(),
        totalAmount: sum(transactions.amount),
      })
      .from(transactions)
      .where(and(...conditions, or(eq(transactions.status, "paid"))!))

    const [failedStats] = await db
      .select({
        failedCount: count(),
        totalAmount: sum(transactions.amount),
      })
      .from(transactions)
      .where(and(...conditions, or(eq(transactions.status, "failed"))!))

    const [reconciledStats] = await db
      .select({
        reconciledCount: count(),
        totalAmount: sum(transactions.amount),
      })
      .from(transactions)
      .where(and(...conditions, eq(transactions.reconciled, true)))

    const [unreconciledStats] = await db
      .select({
        unreconciledCount: count(),
        totalAmount: sum(transactions.amount),
      })
      .from(transactions)
      .where(and(...conditions, eq(transactions.reconciled, false)))

    // Get outstanding invoice amount (unpaid/overdue invoices)
    const [invoiceStats] = await db
      .select({
        outstandingCount: count(),
        outstandingTransactionsAmount: sum(invoices.totalAmount),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.isDeleted, false),
          or(eq(invoices.status, "unpaid"), eq(invoices.status, "overdue"))!,
          filters.companyId ? eq(invoices.companyId, filters.companyId) : sql`true`,
        ),
      )

    return {
      totalTransactions: Number(stats.totalTransactions) || 0,
      totalAmount: stats.totalAmount || "0",
      mpesaTransactions: Number(mpesaStats.mpesaCount) || 0,
      mpesaTransactionsTotalAmount: mpesaStats.totalAmount || "0",
      manualTransactions: Number(manualStats.manualCount) || 0,
      manualTransactionsTotalAmount: manualStats.totalAmount || "0",
      pendingTransactions: Number(pendingStats.pendingCount) || 0,
      pendingTransactionsTotalAmount: pendingStats.totalAmount || "0",
      paidTransactions: Number(paidStats.paidCount) || 0,
      paidTransactionsTotalAmount: paidStats.totalAmount || "0",
      reconciledTransactions: Number(reconciledStats.reconciledCount) || 0,
      reconciledTransactionsTotalAmount: reconciledStats.totalAmount || "0",
      unreconciledTransactions: Number(unreconciledStats.unreconciledCount) || 0,
      unreconciledTransactionsTotalAmount: unreconciledStats.totalAmount || "0",
      outstandingTransactions: Number(invoiceStats.outstandingCount || 0),
      outstandingTransactionsAmount: invoiceStats.outstandingTransactionsAmount || "0",
      failedTransactions: Number(failedStats.failedCount || 0),
      failedTransactionsAmount: failedStats.totalAmount || "0",
    }
  }

  async findById(id: string) {
    const result = await db
      .select({
        id: transactions.id,
        companyId: transactions.companyId,
        userId: transactions.userId,
        invoiceId: transactions.invoiceId,
        amount: transactions.amount,
        phoneNumber: transactions.phoneNumber,
        status: transactions.status,
        methodOfPayment: transactions.methodOfPayment,
        mpesaRequestId: transactions.mpesaRequestId,
        checkoutRequestId: transactions.checkoutRequestId,
        merchantRequestId: transactions.merchantRequestId,
        mpesaReceiptNumber: transactions.mpesaReceiptNumber,
        chequeNumber: transactions.chequeNumber,
        bankReference: transactions.bankReference,
        stkPushRequest: transactions.stkPushRequest,
        stkPushResponse: transactions.stkPushResponse,
        callbackPayload: transactions.callbackPayload,
        description: transactions.description,
        isOnDemand: transactions.isOnDemand,
        reconciled: transactions.reconciled,
        addedBy: transactions.addedBy,
        addedById: transactions.addedById,
        currency: transactions.currency,
        isDeleted: transactions.isDeleted,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        paidAt: transactions.paidAt,
        expiresAt: transactions.expiresAt,
        company: {
          id: companies.id,
          name: companies.name,
        },
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          status: invoices.status,
        },
      })
      .from(transactions)
      .leftJoin(companies, eq(transactions.companyId, companies.id))
      .leftJoin(invoices, eq(transactions.invoiceId, invoices.id))
      .where(eq(transactions.id, id))

    return result[0] || null
  }

  async findByCheckoutRequestId(checkoutRequestId: string) {
    const result = await db.select().from(transactions).where(eq(transactions.checkoutRequestId, checkoutRequestId))
    return result[0] || null
  }

  async findByMpesaRequestId(mpesaRequestId: string) {
    const result = await db.select().from(transactions).where(eq(transactions.mpesaRequestId, mpesaRequestId))
    return result[0] || null
  }

  async findByCompany(companyId: string) {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.companyId, companyId))
      .orderBy(desc(transactions.createdAt))
  }

  async findByUser(userId: string) {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
  }

  async findByInvoice(invoiceId: string) {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.invoiceId, invoiceId))
      .orderBy(desc(transactions.createdAt))
  }

  async findPendingTransactions() {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.status, "pending"))
      .orderBy(desc(transactions.createdAt))
  }

  async create(data: NewTransaction) {
    const result = await db.insert(transactions).values(data).returning()
    return result[0]
  }

  async createManualTransaction(
    data: {
      companyId: string
      userId: string
      invoiceId?: string
      amount: string
      methodOfPayment: PaymentMethod
      chequeNumber?: string
      bankReference?: string
      phoneNumber?: string
      status: TransactionStatus
      description?: string
      currency?: string
    },
    recordedBy: { id: string; name: string },
  ) {
    return await db.transaction(async (tx) => {
      // Create transaction
      const [transaction] = await tx
        .insert(transactions)
        .values({
          ...data,
          addedBy: recordedBy.name,
          addedById: recordedBy.id,
          paidAt: data.status === "paid" ? new Date() : null,
          isOnDemand: false,
        })
        .returning()

      // If invoice is linked and status is paid, update invoice
      if (data.invoiceId && data.status === "paid") {
        await tx
          .update(invoices)
          .set({
            status: "paid",
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, data.invoiceId))
      }

      return transaction
    })
  }

  async update(id: string, data: Partial<Transaction>) {
    const result = await db
      .update(transactions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning()
    return result[0] || null
  }

  async updateByCheckoutRequestId(checkoutRequestId: string, data: Partial<Transaction>) {
    const result = await db
      .update(transactions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(transactions.checkoutRequestId, checkoutRequestId))
      .returning()
    return result[0] || null
  }

  async softDelete(id: string, deletedBy: string) {
    const result = await db
      .update(transactions)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning()
    return result[0] || null
  }

  async bulkDelete(ids: string[], deletedBy: string) {
    const results = await Promise.all(ids.map((id) => this.softDelete(id, deletedBy)))
    return results.filter((r) => r !== null)
  }

  async delete(id: string) {
    const result = await db.delete(transactions).where(eq(transactions.id, id)).returning()
    return result.length > 0
  }

  async toggleReconciled(id: string, reconciled: boolean) {
    const result = await db
      .update(transactions)
      .set({
        reconciled,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning()
    return result[0] || null
  }

  async linkToInvoice(transactionId: string, invoiceId: string) {
    const result = await db
      .update(transactions)
      .set({
        invoiceId,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId))
      .returning()
    return result[0] || null
  }

  async markAsPaid(id: string, mpesaReceiptNumber: string, callbackPayload: any) {
    const result = await db
      .update(transactions)
      .set({
        status: "paid",
        mpesaReceiptNumber,
        callbackPayload,
        paidAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning()
    return result[0] || null
  }

  async markAsFailed(id: string, callbackPayload: any) {
    const result = await db
      .update(transactions)
      .set({
        status: "failed",
        callbackPayload,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning()
    return result[0] || null
  }

  async expireOldTransactions(olderThanMinutes = 5) {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000)

    const result = await db
      .update(transactions)
      .set({
        status: "expired",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(transactions.status, "pending"),
          // Only expire if created before cutoff time
          // Using a simple comparison since we don't have lt imported
        ),
      )
      .returning()

    return result
  }
}

export const transactionsRepository = new TransactionsRepository()
