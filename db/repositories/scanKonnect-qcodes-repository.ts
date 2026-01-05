import { and, eq, sql } from "drizzle-orm"
import { db } from "../index"
import { scankonnectPlans } from "../schema/scanKonnect-plans"
import {
  scankonnectQrcodes,
  type NewScanKonnectQrcode,
  type ScanKonnectQrcode,
  type ScankonnectStatus,
} from "../schema/scanKonnect-qrcodes"
import { BaseRepository } from "./base-repository"

export class ScanKonnectQrcodesRepository extends BaseRepository<ScanKonnectQrcode> {
  tableName = "scankonnect_qrcodes"

  async create(data: NewScanKonnectQrcode): Promise<ScanKonnectQrcode | undefined> {
    try {
      const [qrcode] = await db.insert(scankonnectQrcodes).values(data).returning()
      return qrcode
    } catch (error) {
      this.handleError("create", error)
    }
  }

  async findById(id: string): Promise<ScanKonnectQrcode | undefined> {
    try {
      const [qrcode] = await db.select().from(scankonnectQrcodes).where(eq(scankonnectQrcodes.id, id)).limit(1)
      return qrcode
    } catch (error) {
      this.handleError("findById", error)
    }
  }

    async findBySlug(id: string): Promise<ScanKonnectQrcode | undefined> {
    try {
      const [qrcode] = await db.select().from(scankonnectQrcodes).where(eq(scankonnectQrcodes.id, id)).limit(1)
      return qrcode
    } catch (error) {
      this.handleError("findById", error)
    }
  }

  async findByUserId(userId: string): Promise<ScanKonnectQrcode[]> {
    try {
      return await db
        .select()
        .from(scankonnectQrcodes)
        .where(and(eq(scankonnectQrcodes.userId, userId), eq(scankonnectQrcodes.status, "active")))
        .orderBy(scankonnectQrcodes.createdAt)
    } catch (error) {
      this.handleError("findByUserId", error)
      return []
    }
  }

  async findAll(): Promise<ScanKonnectQrcode[]> {
    try {
      return await db.select().from(scankonnectQrcodes).orderBy(scankonnectQrcodes.createdAt)
    } catch (error) {
      this.handleError("findAll", error)
      return []
    }
  }

  async incrementScanCounter(id: string): Promise<ScanKonnectQrcode | undefined> {
    try {
      const [updated] = await db
        .update(scankonnectQrcodes)
        .set({
          scans: sql`${scankonnectQrcodes.scans} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(scankonnectQrcodes.id, id))
        .returning()
      return updated
    } catch (error) {
      this.handleError("incrementScanCounter", error)
    }
  }

  async update(id: string | number, data: Partial<NewScanKonnectQrcode>): Promise<ScanKonnectQrcode> {
    try {
      const [qrcode] = await db
        .update(scankonnectQrcodes)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(scankonnectQrcodes.id, String(id)))
        .returning()
      if (!qrcode) {
        throw new Error(`QR code with id ${id} not found`)
      }
      return qrcode
    } catch (error) {
      this.handleError("update", error)
    }
  }

  async renewScanKonnect(id: string, planId: string, expiresOn: Date): Promise<ScanKonnectQrcode | undefined> {
    try {
      const [qrcode] = await db
        .update(scankonnectQrcodes)
        .set({
          planId,
          expiresOn,
          status: "active" as ScankonnectStatus,
          updatedAt: new Date(),
        })
        .where(eq(scankonnectQrcodes.id, id))
        .returning()
      return qrcode
    } catch (error) {
      this.handleError("renewScanKonnect", error)
    }
  }

  async updateStatus(id: string, status: ScankonnectStatus): Promise<ScanKonnectQrcode | undefined> {
    try {
      const [qrcode] = await db
        .update(scankonnectQrcodes)
        .set({ status, updatedAt: new Date() })
        .where(eq(scankonnectQrcodes.id, id))
        .returning()
      return qrcode
    } catch (error) {
      this.handleError("updateStatus", error)
    }
  }

  async softDelete(id: string): Promise<ScanKonnectQrcode | undefined> {
    return this.updateStatus(id, "deleted")
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.delete(scankonnectQrcodes).where(eq(scankonnectQrcodes.id, id)).returning()
      return result.length > 0
    } catch (error) {
      this.handleError("delete", error)
      return false
    }
  }

  async getQrcodeWithPlan(id: string) {
    try {
      const [result] = await db
        .select({
          qrcode: scankonnectQrcodes,
          plan: scankonnectPlans,
        })
        .from(scankonnectQrcodes)
        .leftJoin(scankonnectPlans, eq(scankonnectQrcodes.planId, scankonnectPlans.id))
        .where(eq(scankonnectQrcodes.id, id))
        .limit(1)
      return result
    } catch (error) {
      this.handleError("getQrcodeWithPlan", error)
    }
  }
}

export const scankonnectQrcodesRepository = new ScanKonnectQrcodesRepository()
