import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { BaseRepository } from './base-repository'
import { sectors } from '@/db/schema/sectors'
import type { Sector, NewSector } from '@/types/company'

export class SectorRepository extends BaseRepository<Sector | NewSector | null> {
  tableName = 'sectors'

  async create(data: NewSector): Promise<Sector | undefined> {
    try {
      const [created] = await db
        .insert(sectors)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      return created
    } catch (error) {
      this.handleError('create', error)
    }
  }

  async findById(id: string): Promise<Sector | undefined> {
    try {
      const [sector] = await db.select().from(sectors).where(eq(sectors.id, id)).limit(1)
      return sector
    } catch (error) {
      this.handleError('findById', error)
    }
  }

  async findAll(): Promise<Sector[]> {
    try {
      return await db.select().from(sectors)
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  async update(id: string, data: Partial<NewSector>): Promise<Sector> {
    try {
      const [updated] = await db
        .update(sectors)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(sectors.id, id))
        .returning()
      return updated
    } catch (error) {
      this.handleError('update', error)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(sectors).where(eq(sectors.id, id)).returning()
      return !!deleted
    } catch (error) {
      this.handleError('delete', error)
      return false
    }
  }
}

export const sectorRepository = new SectorRepository()
