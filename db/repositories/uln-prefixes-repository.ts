import { createModelSchemas, db } from "@/db"
import { eq, sql } from "drizzle-orm"
import { type NewUlnPrefix, type UlnPrefix, ulnPrefixes } from "../schema/uln-prefixes"
import { BaseRepository } from "./base-repository"

const ulnPrefixSchemas = createModelSchemas("ulnPrefixes")

const updateUlnPrefixSchema = ulnPrefixSchemas.update.partial().omit({ id: true })
const insertUlnPrefixSchema = ulnPrefixSchemas.insert.omit({ id: true })

export class UlnPrefixRepository extends BaseRepository<UlnPrefix> {
  tableName = "ulnPrefixes"


    /**
   * Calculate max companies based on UPI type and prefix length
   */
  private calculateMaxCompanies(type: string, prefixLength: number): number {
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

  async createUlnPrefix(data: NewUlnPrefix): Promise<UlnPrefix | undefined> {
    try {
      const maxCompanies = this.calculateMaxCompanies(data.type, data.prefix.length)
      const validatedData = insertUlnPrefixSchema.parse(data)
      const [newPrefix] = await db.insert(ulnPrefixes).values({...validatedData, maxCompanies}).returning()
      return newPrefix
    } catch (error) {
      this.handleError("createUlnPrefix", error)
    }
  }

  async listUlnPrefixes(): Promise<UlnPrefix[]> {
    try {
      return await db.select().from(ulnPrefixes).orderBy(ulnPrefixes.createdAt)
    } catch (error) {
      this.handleError("listUlnPrefixes", error)
      return []
    }
  }

  async getActiveUlnPrefix(): Promise<UlnPrefix | undefined> {
    try {
      const [activePrefix] = await db.select().from(ulnPrefixes).where(eq(ulnPrefixes.isActive, true)).limit(1)
      return activePrefix
    } catch (error) {
      this.handleError("getActiveUlnPrefix", error)
    }
  }

  async getUlnPrefixById(id: string): Promise<UlnPrefix | undefined> {
    try {
      const [prefix] = await db.select().from(ulnPrefixes).where(eq(ulnPrefixes.id, id)).limit(1)
      return prefix
    } catch (error) {
      this.handleError("getUlnPrefixById", error)
    }
  }

  async setActiveUlnPrefix(prefixId: string): Promise<UlnPrefix | undefined> {
    try {
      return await db.transaction(async (trx) => {
        // First deactivate all other prefixes
        await trx.update(ulnPrefixes).set({ isActive: false }).execute()

        // Then activate the selected prefix
        const [updatedPrefix] = await trx
          .update(ulnPrefixes)
          .set({ isActive: true, updatedAt: new Date() })
          .where(eq(ulnPrefixes.id, prefixId))
          .returning()

        if (!updatedPrefix) throw new Error("Prefix not found")
        return updatedPrefix
      })
    } catch (error) {
      this.handleError("setActiveUlnPrefix", error)
    }
  }

  async incrementPrefixCounters(prefixId: string): Promise<UlnPrefix | undefined> {
    try {
      const [updated] = await db
        .update(ulnPrefixes)
        .set({
          usedCount: sql`${ulnPrefixes.usedCount} + 1`,
          nextSequenceNumber: sql`${ulnPrefixes.nextSequenceNumber} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(ulnPrefixes.id, prefixId))
        .returning()

      return updated
    } catch (error) {
      this.handleError("incrementPrefixCounters", error)
    }
  }

  async canAssignMoreUlns(prefixId: string): Promise<boolean> {
    try {
      const [prefix] = await db.select().from(ulnPrefixes).where(eq(ulnPrefixes.id, prefixId)).limit(1)

      if (!prefix) return false
      return prefix.usedCount < prefix.maxCompanies
    } catch (error) {
      this.handleError("canAssignMoreUlns", error)
      return false
    }
  }

  async deleteUlnPrefix(prefixId: string): Promise<boolean> {
    try {
      const prefix = await this.getUlnPrefixById(prefixId)
      if (!prefix) return false
      if (prefix.usedCount > 0) throw new Error("Cannot delete a prefix that has been used")

      const [deleted] = await db
        .delete(ulnPrefixes)
        .where(eq(ulnPrefixes.id, prefixId))
        .returning({ id: ulnPrefixes.id })
      return !!deleted
    } catch (error) {
      this.handleError("deleteUlnPrefix", error)
      return false
    }
  }

  async updateUlnPrefix(id: string, data: Partial<NewUlnPrefix>): Promise<UlnPrefix | undefined> {
    try {
      const validatedData = updateUlnPrefixSchema.parse(data)
      const [updated] = await db
        .update(ulnPrefixes)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(ulnPrefixes.id, id))
        .returning()

      return updated
    } catch (error) {
      this.handleError("updateUlnPrefix", error)
    }
  }

  async findById(id: string | number): Promise<UlnPrefix | undefined> {
    return this.getUlnPrefixById(String(id))
  }

  async findAll(): Promise<UlnPrefix[]> {
    return this.listUlnPrefixes()
  }

  async create(entity: UlnPrefix): Promise<UlnPrefix | undefined> {
    return this.createUlnPrefix(entity)
  }

  async update(id: string | number, entity: Partial<UlnPrefix>): Promise<UlnPrefix> {
    const result = await this.updateUlnPrefix(String(id), entity)
    if (!result) {
      throw new Error(`ULN prefix with id ${id} not found`)
    }
    return result
  }

  async delete(id: string | number): Promise<boolean> {
    return this.deleteUlnPrefix(String(id))
  }
}

export const ulnPrefixRepository = new UlnPrefixRepository()
