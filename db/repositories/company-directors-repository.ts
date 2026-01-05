import { db } from '@/db'
import { companyDirectors } from '@/db/schema/company-directors'
import type { CompanyDirector, NewCompanyDirector } from '@/types/company'
import { eq } from 'drizzle-orm'
import { BaseRepository } from './base-repository'

export class CompanyDirectorRepository extends BaseRepository<CompanyDirector | NewCompanyDirector | null> {
  tableName = 'company_directors'

  async create(director: NewCompanyDirector): Promise<CompanyDirector | undefined> {
    try {
      const [created] = await db
        .insert(companyDirectors)
        .values({
          ...director,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      return created
    } catch (error) {
      this.handleError('create', error)
    }
  }

  async batchCreate(directors: NewCompanyDirector[]): Promise<CompanyDirector[] | undefined> {
    try {
      const created = await db
        .insert(companyDirectors)
        .values(directors)
        .returning()
      return created
    } catch (error) {
      this.handleError('create', error)
    }
  }

  async findById(id: string): Promise<CompanyDirector | undefined> {
    try {
      const [director] = await db.select().from(companyDirectors).where(eq(companyDirectors.id, id)).limit(1)
      return director
    } catch (error) {
      this.handleError('findById', error)
    }
  }

  async findAll(): Promise<CompanyDirector[]> {
    try {
      return await db.select().from(companyDirectors)
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  async update(id: string, data: Partial<NewCompanyDirector>): Promise<CompanyDirector> {
    try {
      const [updated] = await db
        .update(companyDirectors)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(companyDirectors.id, id))
        .returning()
      return updated
    } catch (error) {
      this.handleError('update', error)
    }
  }

  async deleteAll(): Promise<boolean> {
    try {
      const deleted = await db.delete(companyDirectors).returning()
      return !!deleted.length
    } catch (error) {
      this.handleError('delete', error)
    }
  }


  async delete(id: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(companyDirectors).where(eq(companyDirectors.id, id)).returning()
      return !!deleted
    } catch (error) {
      this.handleError('delete', error)
    }
  }

  async getByCompany(companyId: string): Promise<CompanyDirector[]> {
    try {
      return await db.select().from(companyDirectors).where(eq(companyDirectors.companyId, companyId))
    } catch (error) {
      this.handleError('getByCompany', error)
    }
  }
}

export const companyDirectorRepository = new CompanyDirectorRepository()
