import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { CompanySector, companySectors, NewCompanySector } from '@/db/schema/company-sectors'
import { BaseRepository } from './base-repository'

export class CompanySectorRepository extends BaseRepository<CompanySector> {
  tableName = 'company_sectors'

  async findById(compositeId: string): Promise<CompanySector | undefined> {
    try {
      const [companyId, sectorId] = compositeId.split('::')
      const [result] = await db
        .select()
        .from(companySectors)
        .where(and(eq(companySectors.companyId, companyId), eq(companySectors.sectorId, sectorId)))
        .limit(1)
      return result
    } catch (error) {
      this.handleError('findById', error)
    }
  }

  async findAll(): Promise<CompanySector[]> {
    try {
      return await db.select().from(companySectors)
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  async create(entity: NewCompanySector): Promise<CompanySector | undefined> {
    try {
      const [created] = await db.insert(companySectors).values(entity).returning()
      return created
    } catch (error) {
      this.handleError('create', error)
    }
  }

  async update(_: string, __: Partial<CompanySector>): Promise<CompanySector> {
    // Updating join tables is not supported
    throw new Error('Update not supported for join table CompanySector')
  }

  async delete(compositeId: string): Promise<boolean> {
    try {
      const [companyId, sectorId] = compositeId.split('::')
      const [deleted] = await db
        .delete(companySectors)
        .where(and(eq(companySectors.companyId, companyId), eq(companySectors.sectorId, sectorId)))
        .returning()
      return !!deleted
    } catch (error) {
      this.handleError('delete', error)
      return false
    }
  }


    async deleteAll(): Promise<boolean> {
      try {
        const deleted = await db.delete(companySectors).returning()
        return !!deleted.length
      } catch (error) {
        this.handleError('delete', error)
      }
    }

  async assignSectors(companyId: string, sectorIds: string[]): Promise<CompanySector[]> {
    try {
      await db.delete(companySectors).where(eq(companySectors.companyId, companyId))
      const inserts = sectorIds.map((sectorId) => ({
        companyId,
        sectorId,
      }))
      return await db.insert(companySectors).values(inserts).returning()
    } catch (error) {
      this.handleError('assignSectors', error)
    }
  }

  async getCompanySectors(companyId: string): Promise<CompanySector[]> {
    try {
      return await db.select().from(companySectors).where(eq(companySectors.companyId, companyId))
    } catch (error) {
      this.handleError('getCompanySectors', error)
    }
  }

  async removeSector(companyId: string, sectorId: string): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(companySectors)
        .where(and(eq(companySectors.companyId, companyId), eq(companySectors.sectorId, sectorId)))
        .returning()
      return !!deleted
    } catch (error) {
      this.handleError('removeSector', error)
      return false
    }
  }
}

export const companySectorRepository = new CompanySectorRepository()
