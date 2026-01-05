import { and, eq, isNull } from 'drizzle-orm'
import { db } from '../index'
import { CarryForward, carryForwards, NewCarryForward } from '../schema/carry-forward'
import { BaseRepository } from './base-repository'

export class CarryForwardsRepository extends BaseRepository<CarryForward> {
  tableName = 'carry_forwards'
  async findAll() {
    return await db.select().from(carryForwards)
  }

  async findById(id: string) {
    const result = await db.select().from(carryForwards).where(eq(carryForwards.id, id))
    return result[0] || null
  }

  async findBySubscription(subscriptionId: string) {
    return await db.select().from(carryForwards).where(eq(carryForwards.subscriptionId, subscriptionId))
  }

  async findUnapplied(subscriptionId: string) {
    return await db
      .select()
      .from(carryForwards)
      .where(and(eq(carryForwards.subscriptionId, subscriptionId), isNull(carryForwards.appliedToCycleStart)))
  }

  async getTotalUnappliedAmount(subscriptionId: string) {
    const unapplied = await this.findUnapplied(subscriptionId)
    return unapplied.reduce((total, cf) => total + Number.parseFloat(cf.amount), 0)
  }

  async create(data: NewCarryForward) {
    const result = await db.insert(carryForwards).values(data).returning()
    return result[0]
  }

  async markAsApplied(id: string, appliedToCycleStart: string, appliedToCycleEnd: string) {
    const result = await db
      .update(carryForwards)
      .set({
        appliedToCycleStart,
        appliedToCycleEnd,
      })
      .where(eq(carryForwards.id, id))
      .returning()
    return result[0] || null
  }

  async delete(id: string) {
    const result = await db.delete(carryForwards).where(eq(carryForwards.id, id)).returning()
    return result.length > 0
  }
  async update(id: string, entity: Partial<CarryForward>): Promise<CarryForward> {
    const result = await db.update(carryForwards).set(entity).where(eq(carryForwards.id, id)).returning()
    if (!result[0]) {
      throw new Error('CarryForward not found or update failed')
    }
    return result[0]
  }
}
