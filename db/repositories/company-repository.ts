import { db } from "@/db"
import { companies, NewCompany, type Company } from "@/db/schema/companies"
import { ulnPrefixes } from "@/db/schema/uln-prefixes"
import { count, desc, eq } from "drizzle-orm"
import { calculateChecksumDigit } from "../../lib/services/generation"
import { products } from "../schema/products"
import { BaseRepository } from "./base-repository"

export class CompanyRepository extends BaseRepository<Company> {
  tableName = "companies"

  static padSequenceNumber(sequenceNumber: number, totalLength: number, prefixLength: number): string {
    const productCodeLength = totalLength - prefixLength - 1 // -1 for checksum
    return sequenceNumber.toString().padStart(productCodeLength, '0')
  }

  async create(data: NewCompany): Promise<Company | undefined> {
    try {
      const [company] = await db
        .insert(companies)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      return company
    } catch (error) {
      this.handleError("create", error)
    }
  }

  async createNewCompany(data: NewCompany): Promise<Company | undefined> {
    try {
      const [company] = await db
        .insert(companies)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      return company
    } catch (error) {
      this.handleError("createNewCompany", error)
    }
  }

  async findById(id: string | number): Promise<Company | undefined> {
    try {
      const [company] = await db.select().from(companies).where(eq(companies.id, String(id))).limit(1)
      return company
    } catch (error) {
      this.handleError("findById", error)
    }
  }

  async findByCompanyName(name: string): Promise<Company | undefined> {
    try {
      const [company] = await db.select().from(companies).where(eq(companies.name, name)).limit(1)
      return company
    } catch (error) {
      this.handleError("findById", error)
    }
  }

  async findByUser(userId: string): Promise<Company | undefined> {
    try {
      const [company] = await db.select().from(companies).where(eq(companies.userId, userId)).limit(1)
      return company
    } catch (error) {
      this.handleError("findByUser", error)
    }
  }

  async update(id: string | number, data: Partial<Company>): Promise<Company> {
    try {
      const [updated] = await db
        .update(companies)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(companies.id, String(id)))
        .returning()
      if (!updated) {
        throw new Error(`Company with id ${id} not found`)
      }
      return updated
    } catch (error) {
      this.handleError("update", error)
    }
  }

  async delete(id: string | number): Promise<boolean> {
    try {
      const [deleted] = await db.delete(companies).where(eq(companies.id, String(id))).returning()
      return !!deleted
    } catch (error) {
      this.handleError("delete", error)
    }
  }

  async findAll(): Promise<Company[]> {
    try {
      return await db.select().from(companies).orderBy(desc(companies.createdAt))
    } catch (error) {
      this.handleError("findAll", error)
      return []
    }
  }

    async findAllPaginated(limit: number, offset: number): Promise<{total: number, companies: Company[]}> {
    try {
      const [totalResult, companyListResult] = await Promise.all([
        db.select({total: count()}).from(companies),
        db.select().from(companies).limit(limit).offset(offset).orderBy(desc(companies.createdAt))
      ])
      return {
        total: totalResult[0].total,
        companies: companyListResult
      }
    } catch (error) {
      this.handleError("findAllPaginated", error)
    }
  }

  

  async getCompaniesWithUln(): Promise<(Company & { prefixType?: string })[]> {
    try {
      const result = await db
        .select({
          company: companies,
          prefixType: ulnPrefixes.type,
        })
        .from(companies)
        .leftJoin(ulnPrefixes, eq(companies.ulnPrefixId, ulnPrefixes.id))

      return result.map((row) => ({
        ...row.company,
        prefixType: row.prefixType || undefined,
      }))
    } catch (error) {
      this.handleError("getCompaniesWithUln", error)
      return []
    }
  }

  async assignUlnToCompany(companyId: string): Promise<Company | undefined> {
    try {
      return await db.transaction(async (trx) => {
        // Get the active ULN prefix
        const [activePrefix] = await trx.select().from(ulnPrefixes).where(eq(ulnPrefixes.isActive, true)).limit(1)

        if (!activePrefix) {
          throw new Error("No active ULN prefix found")
        }

        // Check if prefix capacity is exhausted
        if (activePrefix.usedCount >= activePrefix.maxCompanies) {
          throw new Error("Prefix capacity exhausted")
        }

        // Check if company already has a ULN
        const [company] = await trx.select().from(companies).where(eq(companies.id, companyId)).limit(1)

        if (!company) {
          throw new Error("Company not found")
        }

        if (company.ulnNumber) {
          throw new Error("Company already has a ULN number assigned")
        }

        // Generate ULN number
        const totalLengths = {
        UPI13: 13,
        UPI11: 11,
        UPI7: 7,
        }

        const totalLength = totalLengths[activePrefix.type]
        const paddedSequenceNumber = CompanyRepository.padSequenceNumber(activePrefix.nextSequenceNumber, totalLength, activePrefix.prefix.length)
        const baseUlnNumber = activePrefix.prefix + paddedSequenceNumber
        const checksum = calculateChecksumDigit(baseUlnNumber)
        const fullUlnNumber = baseUlnNumber + checksum

        // Update company with new ULN
        const [updatedCompany] = await trx
          .update(companies)
          .set({
            ulnNumber: fullUlnNumber,
            ulnPrefixId: activePrefix.id,
            updatedAt: new Date(),
          })
          .where(eq(companies.id, companyId))
          .returning()

        // Increment prefix counters
        await trx
          .update(ulnPrefixes)
          .set({
            usedCount: activePrefix.usedCount + 1,
            nextSequenceNumber: activePrefix.nextSequenceNumber + 1,
            updatedAt: new Date(),
          })
          .where(eq(ulnPrefixes.id, activePrefix.id))

        return updatedCompany
      })
    } catch (error) {
      this.handleError("assignUlnToCompany", error)
    }
  }
  async findByProductId(productId: string): Promise<Company | undefined> {
  try {
    const result = await db
      .select({ company: companies })
      .from(companies)
      .innerJoin(products, eq(companies.id, products.companyId))
      .where(eq(products.id, productId))
      .limit(1)
    
    return result[0]?.company
  } catch (error) {
    this.handleError("findByProductId", error)
  }
}


  async bulkAssignUln(companyIds: string[]): Promise<{
    success: Array<{ companyId: string; ulnNumber: string }>
    failed: Array<{ companyId: string; reason: string }>
  }> {
    const success: Array<{ companyId: string; ulnNumber: string }> = []
    const failed: Array<{ companyId: string; reason: string }> = []

    for (const companyId of companyIds) {
      try {
        const updated = await this.assignUlnToCompany(companyId)
        if (updated?.ulnNumber) {
          success.push({ companyId, ulnNumber: updated.ulnNumber })
        }
      } catch (error) {
        console.log(error)
        failed.push({
          companyId,
          reason: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    return { success, failed }
  }
}

export const companyRepository = new CompanyRepository()
