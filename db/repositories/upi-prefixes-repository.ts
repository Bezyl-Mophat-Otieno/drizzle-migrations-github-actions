import { db } from '@/db'
import type { NewUpiPrefix, UpiPrefix } from '@/db/schema/upi-prefixes'
import { upiPrefixes } from '@/db/schema/upi-prefixes'
import { and, count, desc, eq, sql } from 'drizzle-orm'
import { users } from '../schema/auth-users'
import { companies } from '../schema/companies'
import { BaseRepository } from './base-repository'

export interface UpiPrefixWithCapacity extends UpiPrefix {
  remainingCapacity: number
  capacityPercentage: number
}

export interface CompanyWithPrefixInfo {
  id: string
  name: string
  email: string
  country: string
  userCount: number
  activePrefix: string | null
  activePrefixType: string | null
}

export interface CreateUpiPrefixData {
  companyId: string
  prefix: string
  type: 'UPI7' | 'UPI11' | 'UPI13'
  isActive?: boolean
}

export class UpiPrefixesRepository extends BaseRepository<UpiPrefix | NewUpiPrefix | undefined> {
  tableName = 'upi_prefixes'

  /**
   * Calculate max products based on UPI type and prefix length
   */
  private calculateMaxProducts(type: string, prefixLength: number): number {
    switch (type) {
      case 'UPI13':
        switch (prefixLength) {
          case 4:
            return 99999999
          case 5:
            return 9999999
          case 6:
            return 999999
          case 7:
            return 99999
          case 8:
            return 9999
          case 9:
            return 999
          case 10:
            return 99
          case 11:
            return 9
          default:
            return 0
        }
      case 'UPI11':
        switch (prefixLength) {
          case 4:
            return 999999
          case 5:
            return 99999
          case 6:
            return 9999
          case 7:
            return 999
          case 8:
            return 99
          case 9:
            return 9
          default:
            return 0
        }
      case 'UPI7':
        switch (prefixLength) {
          case 4:
            return 99
          case 5:
            return 9
          default:
            return 0
        }
      default:
        return 0
    }
  }

  async create(data: NewUpiPrefix): Promise<UpiPrefix | undefined> {
    try {
      const maxProducts = this.calculateMaxProducts(data.type, data.prefix.length)

      const [upiPrefix] = await db
        .insert(upiPrefixes)
        .values({
          ...data,
          maxProducts,
          nextSequenceNumber: 1,
          updatedAt: new Date(),
        })
        .returning()

      return upiPrefix
    } catch (error) {
      this.handleError('create', error)
    }
  }

  async createUpiPrefix(data: CreateUpiPrefixData): Promise<UpiPrefix | undefined> {
    try {
      const maxProducts = this.calculateMaxProducts(data.type, data.prefix.length)

      const [upiPrefix] = await db
        .insert(upiPrefixes)
        .values({
          ...data,
          maxProducts,
          nextSequenceNumber: 1,
          updatedAt: new Date(),
        })
        .returning()

      return upiPrefix
    } catch (error) {
      this.handleError('create', error)
    }
  }

  async findById(id: string): Promise<UpiPrefix | undefined> {
    try {
      const [upiPrefix] = await db.select().from(upiPrefixes).where(eq(upiPrefixes.id, id)).limit(1)

      return upiPrefix
    } catch (error) {
      this.handleError('findById', error)
    }
  }

  async findByCompany(companyId: string): Promise<UpiPrefixWithCapacity[]> {
    try {
      const result = await db
        .select()
        .from(upiPrefixes)
        .where(eq(upiPrefixes.companyId, companyId))
        .orderBy(upiPrefixes.createdAt)

      return result.map((prefix) => ({
        ...prefix,
        remainingCapacity: prefix.maxProducts - prefix.usedCount,
        capacityPercentage: (prefix.usedCount / prefix.maxProducts) * 100,
      }))
    } catch (error) {
      this.handleError('findByCompany', error)
    }
  }

  async findActiveByCompany(companyId: string): Promise<UpiPrefix | null> {
    try {
      const [activePrefix] = await db
        .select()
        .from(upiPrefixes)
        .where(and(eq(upiPrefixes.companyId, companyId), eq(upiPrefixes.isActive, true)))
        .limit(1)

      return activePrefix || null
    } catch (error) {
      this.handleError('findActiveByCompany', error)
    }
  }

  async update(id: string, data: Partial<NewUpiPrefix>): Promise<UpiPrefix | undefined> {
    try {
      // If updating prefix or type, recalculate maxProducts
      const updateData = { ...data, updatedAt: new Date() }

      if (data.prefix || data.type) {
        const existing = await this.findById(id)
        if (existing) {
          const prefix = data.prefix || existing.prefix
          const type = data.type || existing.type
          updateData.maxProducts = this.calculateMaxProducts(type, prefix.length)
        }
      }

      const [upiPrefix] = await db.update(upiPrefixes).set(updateData).where(eq(upiPrefixes.id, id)).returning()

      return upiPrefix
    } catch (error) {
      this.handleError('update', error)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(upiPrefixes).where(eq(upiPrefixes.id, id)).returning()

      return !!deleted
    } catch (error) {
      this.handleError('delete', error)
      return false
    }
  }

  async assignActivePrefix(companyId: string, prefixId: string): Promise<UpiPrefix | null> {
    try {
      return await db.transaction(async (tx) => {
        // Deactivate all existing prefixes for the company
        await tx
          .update(upiPrefixes)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(upiPrefixes.companyId, companyId))

        // Activate the new prefix
        const [activePrefix] = await tx
          .update(upiPrefixes)
          .set({ isActive: true, updatedAt: new Date() })
          .where(and(eq(upiPrefixes.id, prefixId), eq(upiPrefixes.companyId, companyId)))
          .returning()

        return activePrefix || null
      })
    } catch (error) {
      this.handleError('assignActivePrefix', error)
    }
  }

  async checkPrefixExists(prefix: string): Promise<boolean> {
    try {
      const [existing] = await db
        .select({ id: upiPrefixes.id })
        .from(upiPrefixes)
        .where(eq(upiPrefixes.prefix, prefix))
        .limit(1)

      return !!existing
    } catch (error) {
      this.handleError('checkPrefixExists', error)
      return false
    }
  }

  async findAll(): Promise<UpiPrefix[]> {
    try {
      return await db.select().from(upiPrefixes).orderBy(upiPrefixes.createdAt)
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  async findByPrefix(prefix: string): Promise<UpiPrefix | null> {
    try {
      const [upiPrefix] = await db.select().from(upiPrefixes).where(eq(upiPrefixes.prefix, prefix)).limit(1)

      return upiPrefix || null
    } catch (error) {
      this.handleError('findByPrefix', error)
    }
  }

  async findByIdAndCompany(prefixId: string, companyId: string): Promise<UpiPrefix | null> {
    try {
      const [upiPrefix] = await db
        .select()
        .from(upiPrefixes)
        .where(and(eq(upiPrefixes.id, prefixId), eq(upiPrefixes.companyId, companyId)))
        .limit(1)

      return upiPrefix || null
    } catch (error) {
      this.handleError('findByIdAndCompany', error)
    }
  }

  async getCapacityReport(companyId?: string): Promise<UpiPrefixWithCapacity[]> {
    try {
      const result = await db
        .select()
        .from(upiPrefixes)
        .where(companyId ? eq(upiPrefixes.companyId, companyId) : sql`TRUE`)
        .orderBy(upiPrefixes.createdAt)

      return result.map((prefix) => ({
        ...prefix,
        remainingCapacity: prefix.maxProducts - prefix.usedCount,
        capacityPercentage: (prefix.usedCount / prefix.maxProducts) * 100,
      }))
    } catch (error) {
      this.handleError('getCapacityReport', error)
    }
  }

  async getCompaniesWithPrefixes(limit: number, offset: number): Promise<{total: number, companies: CompanyWithPrefixInfo[]}> {
    try {
    const [totalResult, companiesWithPrefixes] = await Promise.all([
      db.select({ total: count() }).from(companies),
      db.select({
        id: companies.id,
        name: companies.name,
        email: companies.email,
        country: companies.country,
        ulnNumber: companies.ulnNumber,
        userCount: sql<number>`COUNT(DISTINCT ${users.id})`.as("user_count"),
        activePrefix: sql<string | null>`
          MAX(CASE WHEN ${upiPrefixes.isActive} = true THEN ${upiPrefixes.prefix} END)
        `.as("active_prefix"),
        activePrefixType: sql<string | null>`
          MAX(CASE WHEN ${upiPrefixes.isActive} = true THEN ${upiPrefixes.type} END)
        `.as("active_prefix_type"),
      })
      .from(companies)
      .leftJoin(users, eq(users.companyId, companies.id))
      .leftJoin(upiPrefixes, eq(upiPrefixes.companyId, companies.id))
      .groupBy(companies.id, companies.name, companies.email, companies.country)
      .orderBy(desc(companies.createdAt))
      .limit(limit)
      .offset(offset)
    ])

        

       const companiesList = companiesWithPrefixes.map((company) => ({
        ...company,
        userCount: Number(company.userCount) || 0,
      }))

      return {
        total: totalResult[0].total,
        companies: companiesList
      }
    } catch (error) {
      this.handleError('getCompaniesWithPrefixes', error)
        }
  }
}

export const upiPrefixesRepository = new UpiPrefixesRepository()
