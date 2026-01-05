import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm"
import { db } from "../index"
import { users } from "../schema/auth-users"
import { companies } from "../schema/companies"
import { invoiceItems, type NewInvoiceItem } from "../schema/invoice-items"
import { type Invoice, invoices, type InvoiceStatus, type NewInvoice } from "../schema/invoices"
import { subscriptions } from "../schema/subscriptions"
import { BaseRepository } from "./base-repository"

export interface InvoiceFilters {
  companyId?: string
  status?: InvoiceStatus
  search?: string
  startDate?: string
  endDate?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export class InvoicesRepository extends BaseRepository<Invoice> {
  tableName = "invoices"

  async findAll() {
    return await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        companyId: invoices.companyId,
        service: invoices.service,
        invoiceDate: invoices.invoiceDate,
        dueDate: invoices.dueDate,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        pdfUrl: invoices.pdfUrl,
        createdAt: invoices.createdAt,
        company: {
          id: companies.id,
          name: companies.name,
        },
        createdByUser: {
          id: users.id,
          username: users.username,
        },
      })
      .from(invoices)
      .leftJoin(companies, eq(invoices.companyId, companies.id))
      .leftJoin(users, eq(invoices.createdBy, users.id))
      .where(eq(invoices.isDeleted, false))
      .orderBy(desc(invoices.createdAt))
  }

  async findPaginated(filters: InvoiceFilters, pagination: PaginationParams) {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = [eq(invoices.isDeleted, false)]

    if (filters.companyId && filters.companyId !== "all") {
      conditions.push(eq(invoices.companyId, filters.companyId))
    }

    if (filters.status) {
      conditions.push(eq(invoices.status, filters.status))
    }

    if (filters.search) {
      conditions.push(
        or(ilike(invoices.invoiceNumber, `%${filters.search}%`), ilike(companies.name, `%${filters.search}%`))!,
      )
    }

    if (filters.startDate) {
      conditions.push(sql`${invoices.invoiceDate} >= ${filters.startDate}`)
    }

    if (filters.endDate) {
      conditions.push(sql`${invoices.invoiceDate} <= ${filters.endDate}`)
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(invoices)
      .leftJoin(companies, eq(invoices.companyId, companies.id))
      .where(and(...conditions))

    // Get paginated results
    const items = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        companyId: invoices.companyId,
        notes: invoices.notes,
        service: invoices.service,
        invoiceDate: invoices.invoiceDate,
        dueDate: invoices.dueDate,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        pdfUrl: invoices.pdfUrl,
        preparedBy: invoices.preparedBy,
        createdAt: invoices.createdAt,
        invoiceType: invoices.invoiceType,
        company: {
          id: companies.id,
          name: companies.name,
          email: companies.email,
        },
        createdByUser: {
          id: users.id,
          username: users.username,
        },
      })
      .from(invoices)
      .leftJoin(companies, eq(invoices.companyId, companies.id))
      .leftJoin(users, eq(invoices.createdBy, users.id))
      .where(and(...conditions))
      .orderBy(desc(invoices.createdAt))
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
        id: invoices.id,
        invoiceType: invoices.invoiceType,
        invoiceNumber: invoices.invoiceNumber,
        companyId: invoices.companyId,
        createdBy: invoices.createdBy,
        service: invoices.service,
        notes: invoices.notes,
        adminNotes: invoices.adminNotes,
        preparedBy: invoices.preparedBy,
        invoiceDate: invoices.invoiceDate,
        dueDate: invoices.dueDate,
        subtotal: invoices.subtotal,
        tax: invoices.tax,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        pdfUrl: invoices.pdfUrl,
        pdfKey: invoices.pdfKey,
        generatedAt: invoices.generatedAt,
        emailSentAt: invoices.emailSentAt,
        emailSentTo: invoices.emailSentTo,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        company: {
          id: companies.id,
          name: companies.name,
          email: companies.email,
          physicalAddress: companies.physicalAddress,
        },
        createdByUser: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(invoices)
      .leftJoin(companies, eq(invoices.companyId, companies.id))
      .leftJoin(users, eq(invoices.createdBy, users.id))
      .where(and(eq(invoices.id, id), eq(invoices.isDeleted, false)))

    return result[0] || null
  }

  async findByInvoiceNumber(invoiceNumber: string) {
    const result = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.invoiceNumber, invoiceNumber), eq(invoices.isDeleted, false)))

    return result[0] || null
  }

  async findWithItems(id: string) {
    const invoice = await this.findById(id)

    if (!invoice) return null

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id))
      .orderBy(invoiceItems.sortOrder)

    if (!invoice || typeof invoice !== "object") {
      throw new Error("Invalid invoice object: " + JSON.stringify(invoice))
    }

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      companyId: invoice.companyId,
      createdBy: invoice.createdBy,
      service: invoice.service,
      adminNotes: invoice.adminNotes,
      notes: invoice.notes,
      preparedBy: invoice.preparedBy,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
      pdfUrl: invoice.pdfUrl,
      pdfKey: invoice.pdfKey,
      generatedAt: invoice.generatedAt,
      emailSentAt: invoice.emailSentAt,
      emailSentTo: invoice.emailSentTo,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      company: invoice.company,
      createdByUser: invoice.createdByUser,
      items,
    }
  }

  async create(data: NewInvoice) {
    const result = await db.insert(invoices).values(data).returning()
    return result[0]
  }

  async createWithItems(invoiceData: NewInvoice, items: Array<Omit<NewInvoiceItem, "invoiceId">>) {
    return await db.transaction(async (tx) => {
      // Create invoice
      const [invoice] = await tx.insert(invoices).values(invoiceData).returning()

      // Create invoice items with sort order
      const invoiceItemsData = items.map((item, index) => {
        if (!item || typeof item !== "object") {
          throw new Error(`Invalid item at index ${index}: ${JSON.stringify(item)}`)
        }

        return {
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          invoiceId: invoice.id,
          sortOrder: index,
        }
      })

      const createdItems = await tx.insert(invoiceItems).values(invoiceItemsData).returning()

      return {
        ...invoice,
        items: createdItems,
      }
    })
  }

  async update(id: string, data: Partial<Invoice>) {
    const result = await db
      .update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning()
    return result[0] || null
  }

  async updateStatus(id: string, status: InvoiceStatus) {
    return await this.update(id, { status })
  }

  async setPdfInfo(id: string, pdfUrl: string, pdfKey: string) {
    return await this.update(id, {
      pdfUrl,
      pdfKey,
      generatedAt: new Date(),
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
      .update(invoices)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, id))
      .returning()
    return result[0] || null
  }

  async delete(id: string) {
    // Hard delete - also deletes items due to cascade
    const result = await db.delete(invoices).where(eq(invoices.id, id)).returning()
    return result.length > 0
  }

  async findBySubscription(subscriptionId: string) {
    // First get the subscription to find the companyId
    const subscription = await db
      .select({ companyId: subscriptions.companyId })
      .from(subscriptions)
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1)

    if (!subscription.length) {
      return []
    }

    return await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        companyId: invoices.companyId,
        service: invoices.service,
        invoiceDate: invoices.invoiceDate,
        dueDate: invoices.dueDate,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        pdfUrl: invoices.pdfUrl,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .where(and(eq(invoices.companyId, subscription[0].companyId), eq(invoices.isDeleted, false)))
      .orderBy(desc(invoices.createdAt))
  }

  async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    const prefix = `INV-${year}-`

    // Get the latest invoice number for this year
    const result = await db
      .select({ invoiceNumber: invoices.invoiceNumber })
      .from(invoices)
      .where(ilike(invoices.invoiceNumber, `${prefix}%`))
      .orderBy(desc(invoices.invoiceNumber))
      .limit(1)

    if (result.length === 0) {
      return `${prefix}0001`
    }

    // Extract the number and increment
    const lastNumber = result[0].invoiceNumber.split("-").pop()
    const nextNumber = Number.parseInt(lastNumber || "0", 10) + 1

    return `${prefix}${nextNumber.toString().padStart(4, "0")}`
  }

  async updateWithItems(
    invoiceId: string,
    invoiceData: Partial<Invoice>,
    items?: Array<Omit<NewInvoiceItem, "invoiceId">>,
  ) {
    return await db.transaction(async (tx) => {
      // Update invoice
      const updated = await tx
        .update(invoices)
        .set({ ...invoiceData, updatedAt: new Date() })
        .where(eq(invoices.id, invoiceId))
        .returning()

      // Update line items if provided
      if (items && items.length > 0) {
        // Delete existing items
        await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId))

        // Insert new items
        const invoiceItemsData = items.map((item, index) => {
          if (!item || typeof item !== "object") {
            throw new Error(`Invalid item at index ${index}: ${JSON.stringify(item)}`)
          }

          return {
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            invoiceId,
            sortOrder: index,
          }
        })

        await tx.insert(invoiceItems).values(invoiceItemsData)
      }

      return updated[0] || null
    })
  }
}

export const invoicesRepository = new InvoicesRepository()
