import { db } from "@/db"
import { companyCertificates, type CompanyCertificate } from "@/db/schema/company-certificates"
import { and, desc, eq, like } from "drizzle-orm"
import { BaseRepository } from "./base-repository"
import { companies } from "../schema/companies"

export class CompanyCertificatesRepository extends BaseRepository<CompanyCertificate> {
  tableName = "company_certificates"

  async create(data: Omit<CompanyCertificate, "id" | "createdAt" | "updatedAt">): Promise<CompanyCertificate | undefined> {
    try {
      const [certificate] = await db
        .insert(companyCertificates)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      return certificate
    } catch (error) {
      console.error("Database insert error details:", error)
      this.handleError("create", error)
    }
  }

  async findById(id: string): Promise<CompanyCertificate | undefined> {
    try {
      const [certificate] = await db
        .select()
        .from(companyCertificates)
        .where(eq(companyCertificates.id, id))
        .limit(1)
      return certificate
    } catch (error) {
      this.handleError("findById", error)
    }
  }

  async findByNumber(certificateNumber: string): Promise<CompanyCertificate | undefined> {
    try {
      const [certificate] = await db
        .select()
        .from(companyCertificates)
        .where(eq(companyCertificates.certificateNumber, certificateNumber))
        .limit(1)
      return certificate
    } catch (error) {
      this.handleError("findByNumber", error)
    }
  }

  async findByCompanyId(companyId: string): Promise<CompanyCertificate[]> {
    try {
      return await db
        .select()
        .from(companyCertificates)
        .where(eq(companyCertificates.companyId, companyId))
        .orderBy(desc(companyCertificates.createdAt))
    } catch (error) {
      this.handleError("findByCompanyId", error)
      return []
    }
  }

    async findAll(filters?: {
    companyId?: string
    certificateType?: string
    status?: string
    searchTerm?: string
  }): Promise<CompanyCertificate[]> {
    try {
      let query = db.select().from(companyCertificates)
      const conditions = []

      if (filters?.companyId) {
        conditions.push(eq(companyCertificates.companyId, filters.companyId))
      }

      if (filters?.certificateType) {
        conditions.push(eq(companyCertificates.certificateType, filters.certificateType as any))
      }

      if (filters?.status) {
        conditions.push(eq(companyCertificates.status, filters.status as any))
      }

      if (filters?.searchTerm) {
        conditions.push(like(companyCertificates.certificateNumber, `%${filters.searchTerm}%`))
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions))
      }

      return await query.orderBy(desc(companyCertificates.createdAt))
    } catch (error) {
      this.handleError("findAll", error)
      return []
    }
  }

  async findAllcertficatesWithCompany(filters?: {
    companyId?: string
    certificateType?: string
    status?: string
    searchTerm?: string
  }): Promise<CompanyCertificate[]> {
    try {
      let query = db.select({...companyCertificates, company: companies}).from(companyCertificates).innerJoin(companies, eq(companies.id, companyCertificates.companyId))
      const conditions = []

      if (filters?.companyId) {
        conditions.push(eq(companyCertificates.companyId, filters.companyId))
      }

      if (filters?.certificateType) {
        conditions.push(eq(companyCertificates.certificateType, filters.certificateType as any))
      }

      if (filters?.status) {
        conditions.push(eq(companyCertificates.status, filters.status as any))
      }

      if (filters?.searchTerm) {
        conditions.push(like(companyCertificates.certificateNumber, `%${filters.searchTerm}%`))
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions))
      }

      return await query.orderBy(desc(companyCertificates.createdAt))
    } catch (error) {
      this.handleError("findAll", error)
      return []
    }
  }

  async update(id: string, data: Partial<CompanyCertificate>): Promise<CompanyCertificate | undefined> {
    try {
      const [updated] = await db
        .update(companyCertificates)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(companyCertificates.id, id))
        .returning()
      return updated
    } catch (error) {
      this.handleError("update", error)
    }
  }

  async setPdfInfo(id: string, pdfUrl: string, pdfKey: string): Promise<boolean> {
    try {
      const [updated] = await db
        .update(companyCertificates)
        .set({
          pdfUrl,
          pdfKey,
          updatedAt: new Date(),
        })
        .where(eq(companyCertificates.id, id))
        .returning()
      return !!updated
    } catch (error) {
      this.handleError("setPdfInfo", error)
      return false
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(companyCertificates)
        .where(eq(companyCertificates.id, id))
        .returning()
      return !!deleted
    } catch (error) {
      this.handleError("delete", error)
      return false
    }
  }

  async getNextCertificateNumber(prefix: string): Promise<string> {
    try {
      const result = await db
        .select()
        .from(companyCertificates)
        .where(like(companyCertificates.certificateNumber, `${prefix}%`))
        .orderBy(desc(companyCertificates.certificateNumber))
        .limit(1)

      if (!result.length) {
        return `${prefix}0001`
      }

      const lastNumber = result[0].certificateNumber
      const numPart = parseInt(lastNumber.slice(prefix.length), 10)
      return `${prefix}${String(numPart + 1).padStart(4, "0")}`
    } catch (error) {
      this.handleError("getNextCertificateNumber", error)
      return `${prefix}0001`
    }
  }
}

export const companyCertificatesRepository = new CompanyCertificatesRepository()
