import { eq } from "drizzle-orm"
import { db } from "../index"
import {
  scankonnectPlans,
  type ScanKonnectPlan,
  type NewScanKonnectPlan,
  type ScankonnectPlanStatus,
} from "../schema/scanKonnect-plans"
import { BaseRepository } from "./base-repository"

export class ScanKonnectPlansRepository extends BaseRepository<ScanKonnectPlan> {
  tableName = "scankonnect_plans"

  async create(data: NewScanKonnectPlan): Promise<ScanKonnectPlan | undefined> {
    try {
      const [plan] = await db.insert(scankonnectPlans).values(data).returning()
      return plan
    } catch (error) {
      this.handleError("create", error)
    }
  }

  async findById(id: string): Promise<ScanKonnectPlan | undefined> {
    try {
      const [plan] = await db.select().from(scankonnectPlans).where(eq(scankonnectPlans.id, id)).limit(1)
      return plan
    } catch (error) {
      this.handleError("findById", error)
    }
  }

  async findAll(): Promise<ScanKonnectPlan[]> {
    try {
      return await db.select().from(scankonnectPlans)
    } catch (error) {
      this.handleError("findAll", error)
      return []
    }
  }

  async findActive(): Promise<ScanKonnectPlan[]> {
    try {
      return await db.select().from(scankonnectPlans).where(eq(scankonnectPlans.status, "active"))
    } catch (error) {
      this.handleError("findActive", error)
      return []
    }
  }

  async update(id: string, data: Partial<NewScanKonnectPlan>): Promise<ScanKonnectPlan | undefined> {
    try {
      const [plan] = await db
        .update(scankonnectPlans)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(scankonnectPlans.id, id))
        .returning()
      return plan
    } catch (error) {
      this.handleError("update", error)
    }
  }

  async deactivate(id: string): Promise<ScanKonnectPlan | undefined> {
    return this.update(id, { status: "inactive" as ScankonnectPlanStatus })
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.delete(scankonnectPlans).where(eq(scankonnectPlans.id, id)).returning()
      return result.length > 0
    } catch (error) {
      this.handleError("delete", error)
      return false
    }
  }
}

export const scankonnectPlansRepository = new ScanKonnectPlansRepository()
