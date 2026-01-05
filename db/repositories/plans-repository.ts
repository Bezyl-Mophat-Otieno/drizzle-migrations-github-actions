import { eq } from 'drizzle-orm'
import { db } from '../index'
import { categories } from '../schema/categories'
import { Plan, plans } from '../schema/plans'
import { BaseRepository } from './base-repository'

export class PlansRepository extends BaseRepository<Plan> {
  tableName = 'plans'
  async findAll() {
    return await db
      .select({
        id: plans.id,
        categoryId: plans.categoryId,
        name: plans.name,
        maintenanceFee: plans.maintenanceFee,
        codeFee: plans.codeFee,
        billingCycle: plans.billingCycle,
        usageLimit: plans.usageLimit,
        createdAt: plans.createdAt,
        updatedAt: plans.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
        },
      })
      .from(plans)
      .leftJoin(categories, eq(plans.categoryId, categories.id))
  }

  async findById(id: string) {
    const result = await db
      .select({
        id: plans.id,
        categoryId: plans.categoryId,
        name: plans.name,
        maintenanceFee: plans.maintenanceFee,
        codeFee: plans.codeFee,
        billingCycle: plans.billingCycle,
        usageLimit: plans.usageLimit,
        createdAt: plans.createdAt,
        updatedAt: plans.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
        },
      })
      .from(plans)
      .leftJoin(categories, eq(plans.categoryId, categories.id))
      .where(eq(plans.id, id))
    return result[0] || null
  }

  async findByCategory(categoryId: string) {
    return await db.select().from(plans).where(eq(plans.categoryId, categoryId))
  }

  async create(data: typeof plans.$inferInsert) {
    const result = await db.insert(plans).values(data).returning()
    return result[0]
  }

  async update(id: string, data: Partial<typeof plans.$inferInsert>) {
    const result = await db
      .update(plans)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning()
    return result[0] || null
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(plans).where(eq(plans.id, id)).returning()
    return result.length > 0
  }
}

export const plansRepository = new PlansRepository()
