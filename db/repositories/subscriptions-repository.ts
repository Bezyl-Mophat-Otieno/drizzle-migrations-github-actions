import { and, count, eq, lte } from "drizzle-orm"
import { db } from "../index"
import { categories } from "../schema/categories"
import { companies } from "../schema/companies"
import { plans } from "../schema/plans"
import { type NewSubscription, type Subscription, subscriptions } from "../schema/subscriptions"
import { BaseRepository } from "./base-repository"

export class SubscriptionsRepository extends BaseRepository<Subscription> {
  tableName = "subscriptions"

  async findAllPaginated(limit = 10, offset = 0) {
    const [results, countResult, activeResult, expiredResult, pendingResult] = await Promise.all([
      db
        .select({
          id: subscriptions.id,
          companyId: subscriptions.companyId,
          planId: subscriptions.planId,
          status: subscriptions.status,
          startDate: subscriptions.startDate,
          endDate: subscriptions.endDate,
          currentPeriodStart: subscriptions.currentPeriodStart,
          currentPeriodEnd: subscriptions.currentPeriodEnd,
          nextBillingDate: subscriptions.nextBillingDate,
          createdAt: subscriptions.createdAt,
          updatedAt: subscriptions.updatedAt,
          plan: {
            id: plans.id,
            name: plans.name,
            maintenanceFee: plans.maintenanceFee,
            codeFee: plans.codeFee,
            billingCycle: plans.billingCycle,
            usageLimit: plans.usageLimit,
          },
          company: {
            id: companies.id,
            name: companies.name,
            email: companies.email,
            categoryId: companies.categoryId,
          },
          category: {
            id: categories.id,
            name: categories.name,
          },
        })
        .from(subscriptions)
        .leftJoin(plans, eq(subscriptions.planId, plans.id))
        .leftJoin(categories, eq(plans.categoryId, categories.id))
        .leftJoin(companies, eq(subscriptions.companyId, companies.id))
        .limit(limit)
        .offset(offset)
        .orderBy(subscriptions.createdAt),
      db.select({ total: count() }).from(subscriptions),
      db.select({ countActive: count() }).from(subscriptions).where(eq(subscriptions.status, "active")),
      db.select({ countExpired: count() }).from(subscriptions).where(eq(subscriptions.status, "canceled")),
      db.select({ countPending: count() }).from(subscriptions).where(eq(subscriptions.status, "pending")),
    ])

    const total = countResult[0]?.total || 0
    const totalActive = activeResult[0]?.countActive || 0
    const totalExpired = expiredResult[0]?.countExpired || 0
    const totalPending = pendingResult[0]?.countPending || 0

    return {
      data: results,
      stats: {
        total,
        totalActive,
        totalExpired,
        totalPending
      },
      limit,
      offset,
    }
  }

  async findAll() {
    return await db
      .select({
        id: subscriptions.id,
        companyId: subscriptions.companyId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        nextBillingDate: subscriptions.nextBillingDate,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        plan: {
          id: plans.id,
          name: plans.name,
          maintenanceFee: plans.maintenanceFee,
          codeFee: plans.codeFee,
          billingCycle: plans.billingCycle,
          usageLimit: plans.usageLimit,
        },
        company: {
          id: companies.id,
          name: companies.name,
          email: companies.email,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(subscriptions)
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .leftJoin(categories, eq(plans.categoryId, categories.id))
      .leftJoin(companies, eq(subscriptions.companyId, companies.id))
  }

  async findById(id: string) {
    const result = await db
      .select({
        id: subscriptions.id,
        companyId: subscriptions.companyId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        nextBillingDate: subscriptions.nextBillingDate,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        plan: {
          id: plans.id,
          name: plans.name,
          maintenanceFee: plans.maintenanceFee,
          codeFee: plans.codeFee,
          billingCycle: plans.billingCycle,
          usageLimit: plans.usageLimit,
        },
        company: {
          id: companies.id,
          name: companies.name,
          email: companies.email,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(subscriptions)
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .leftJoin(categories, eq(plans.categoryId, categories.id))
      .leftJoin(companies, eq(subscriptions.companyId, companies.id))
      .where(eq(subscriptions.id, id))
    return result[0] || null
  }

  async findByCompany(companyId: string) {
    return await db
      .select({
        id: subscriptions.id,
        companyId: subscriptions.companyId,
        userId: companies.userId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        nextBillingDate: subscriptions.nextBillingDate,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        plan: {
          id: plans.id,
          name: plans.name,
          maintenanceFee: plans.maintenanceFee,
          codeFee: plans.codeFee,
          billingCycle: plans.billingCycle,
          usageLimit: plans.usageLimit,
        },
      })
      .from(subscriptions)
      .innerJoin(companies, eq(companies.id, companyId))
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .where(and(eq(subscriptions.companyId, companyId)))
      .limit(1)
      .then((res) => res[0] || null)
  }

  async findActiveByCompany(companyId: string) {
    const result = await db
      .select({
        id: subscriptions.id,
        companyId: subscriptions.companyId,
        userId: companies.userId,
        planId: subscriptions.planId,
        status: subscriptions.status,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        nextBillingDate: subscriptions.nextBillingDate,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
        plan: plans,
      })
      .from(subscriptions)
      .innerJoin(companies, eq(companies.id, companyId))
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .where(and(eq(subscriptions.companyId, companyId), eq(subscriptions.status, "active")))
    return result[0] || null
  }

async hasExclusiveQRSubscription(companyId: string) {
  const exclusiveQRCategoryId = process.env.NEXT_PUBLIC_EXCLUSIVE_QR_CATEGORY_ID;
  
  if (!exclusiveQRCategoryId) {
    throw new Error('NEXT_PUBLIC_EXCLUSIVE_QR_CATEGORY_ID environment variable is not set');
  }

  const result = await db
    .select({ subscription: subscriptions, plan: plans })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(
      and(
        eq(subscriptions.companyId, companyId),
        eq(subscriptions.status, 'active'),
        eq(plans.categoryId, exclusiveQRCategoryId)
      )
    )
    .limit(1);

  return {hasExclusiveQRSubscription: result.length > 0, exclusiveQrSubscription: { ...result[0]?.subscription, plan: result[0]?.plan}};
}

  async findExpiring(days = 30) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.status, "active"), lte(subscriptions.nextBillingDate, futureDate)))
  }

  async create(data: NewSubscription) {
    const result = await db.insert(subscriptions).values(data).returning()
    return result[0]
  }

  async update(id: string, data: Partial<Subscription>) {
    const result = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning()
    return result[0] || null
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(subscriptions).where(eq(subscriptions.id, id)).returning()
    return result.length > 0
  }
}

export const subscriptionsRepository = new SubscriptionsRepository()
