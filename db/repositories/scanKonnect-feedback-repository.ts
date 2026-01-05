import { eq, sql } from "drizzle-orm"
import { db } from "../index"
import {
  scankonnectFeedbackRatings,
  type ScanKonnectFeedbackRating,
  type NewScanKonnectFeedbackRating,
} from "../schema/scanKonnect-feedback-ratings"
import { BaseRepository } from "./base-repository"

export class ScanKonnectFeedbackRepository extends BaseRepository<ScanKonnectFeedbackRating> {
  tableName = "scankonnect_feedback_ratings"

  async create(data: NewScanKonnectFeedbackRating): Promise<ScanKonnectFeedbackRating | undefined> {
    try {
      const [feedback] = await db.insert(scankonnectFeedbackRatings).values(data).returning()
      return feedback
    } catch (error) {
      this.handleError("create", error)
    }
  }

  async findById(id: string): Promise<ScanKonnectFeedbackRating | undefined> {
    try {
      const [feedback] = await db
        .select()
        .from(scankonnectFeedbackRatings)
        .where(eq(scankonnectFeedbackRatings.id, id))
        .limit(1)
      return feedback
    } catch (error) {
      this.handleError("findById", error)
    }
  }

  async listFeedback(qrcodeId: string): Promise<ScanKonnectFeedbackRating[]> {
    try {
      return await db
        .select()
        .from(scankonnectFeedbackRatings)
        .where(eq(scankonnectFeedbackRatings.scanKonnectQrcodeId, qrcodeId))
        .orderBy(scankonnectFeedbackRatings.createdAt)
    } catch (error) {
      this.handleError("listFeedback", error)
      return []
    }
  }

  async getAverageRating(qrcodeId: string): Promise<number> {
    try {
      const [result] = await db
        .select({
          average: sql<number>`avg(${scankonnectFeedbackRatings.rating})`,
        })
        .from(scankonnectFeedbackRatings)
        .where(eq(scankonnectFeedbackRatings.scanKonnectQrcodeId, qrcodeId))
      return result?.average ? Math.round(result.average * 10) / 10 : 0
    } catch (error) {
      this.handleError("getAverageRating", error)
      return 0
    }
  }

  async getRatingCount(qrcodeId: string): Promise<number> {
    try {
      const [result] = await db
        .select({ count: sql<number>`count(*)` })
        .from(scankonnectFeedbackRatings)
        .where(eq(scankonnectFeedbackRatings.scanKonnectQrcodeId, qrcodeId))
      return result?.count || 0
    } catch (error) {
      this.handleError("getRatingCount", error)
      return 0
    }
  }

  async findAll(): Promise<ScanKonnectFeedbackRating[]> {
    try {
      return await db.select().from(scankonnectFeedbackRatings)
    } catch (error) {
      this.handleError("findAll", error)
      return []
    }
  }

  async update(
    id: string,
    data: Partial<NewScanKonnectFeedbackRating>,
  ): Promise<ScanKonnectFeedbackRating | undefined> {
    try {
      const [feedback] = await db
        .update(scankonnectFeedbackRatings)
        .set(data)
        .where(eq(scankonnectFeedbackRatings.id, id))
        .returning()
      return feedback
    } catch (error) {
      this.handleError("update", error)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(scankonnectFeedbackRatings)
        .where(eq(scankonnectFeedbackRatings.id, id))
        .returning()
      return result.length > 0
    } catch (error) {
      this.handleError("delete", error)
      return false
    }
  }
}

export const scankonnectFeedbackRepository = new ScanKonnectFeedbackRepository()
