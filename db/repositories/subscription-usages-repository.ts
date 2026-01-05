import { and, eq, sum } from 'drizzle-orm'
import { db } from '../index'
import { NewSubscriptionUsage, SubscriptionUsage, subscriptionUsages } from '../schema/subscription-usages'
import { BaseRepository } from './base-repository'

export class SubscriptionUsagesRepository extends BaseRepository<SubscriptionUsage> {
  tableName = 'subscription_usages'
  async findAll() {
    return await db.select().from(subscriptionUsages)
  }

  async findById(id: string) {
    const result = await db.select().from(subscriptionUsages).where(eq(subscriptionUsages.id, id))
    return result[0] || null
  }

  async findBySubscription(subscriptionId: string) {
    return await db.select().from(subscriptionUsages).where(eq(subscriptionUsages.subscriptionId, subscriptionId))
  }

  async findCurrentCycleUsage(subscriptionId: string, cycleStart: string, cycleEnd: string) {
    const result = await db
      .select()
      .from(subscriptionUsages)
      .where(
        and(
          eq(subscriptionUsages.subscriptionId, subscriptionId),
          eq(subscriptionUsages.cycleStart, cycleStart),
          eq(subscriptionUsages.cycleEnd, cycleEnd)
        )
      )
    return result[0] || null
  }

  async getTotalUsageForCycle(subscriptionId: string, cycleStart: string, cycleEnd: string) {
    const result = await db
      .select({
        totalCodes: sum(subscriptionUsages.generatedCodes),
        totalCharges: sum(subscriptionUsages.extraCharges),
      })
      .from(subscriptionUsages)
      .where(
        and(
          eq(subscriptionUsages.subscriptionId, subscriptionId),
          eq(subscriptionUsages.cycleStart, cycleStart),
          eq(subscriptionUsages.cycleEnd, cycleEnd)
        )
      )
    return result[0] || { totalCodes: 0, totalCharges: '0' }
  }

  async create(data: NewSubscriptionUsage) {
    const result = await db.insert(subscriptionUsages).values(data).returning()
    return result[0]
  }

  async update(id: string, data: Partial<SubscriptionUsage>) {
    const result = await db
      .update(subscriptionUsages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptionUsages.id, id))
      .returning()
    return result[0] || null
  }

  async incrementUsage(
    subscriptionId: string,
    cycleStart: string,
    cycleEnd: string,
    codesGenerated: number,
    extraCharges = '0'
  ) {
    // First try to find existing usage record
    const existing = await this.findCurrentCycleUsage(subscriptionId, cycleStart, cycleEnd)

    if (existing) {
      // Update existing record
      return await this.update(existing.id, {
        generatedCodes: existing.generatedCodes + codesGenerated,
        extraCharges: (Number.parseFloat(existing.extraCharges || '0') + Number.parseFloat(extraCharges)).toString(),
      })
    } else {
      // Create new record
      return await this.create({
        subscriptionId,
        cycleStart,
        cycleEnd,
        generatedCodes: codesGenerated,
        extraCharges,
      })
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(subscriptionUsages).where(eq(subscriptionUsages.id, id)).returning()
    return result.length > 0
  }
}
