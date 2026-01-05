import { eq } from "drizzle-orm"
import { db } from ".."
import { type Category, categories } from "../schema/categories"
import { BaseRepository } from "./base-repository"

export class CategoriesRepository extends BaseRepository<Category> {
  tableName = "categories"

  async findAll() {
    return await db.select().from(categories).orderBy(categories.name)
  }

  async findById(id: string) {
    const result = await db.select().from(categories).where(eq(categories.id, id))
    return result[0] || null
  }

  async create(data: typeof categories.$inferInsert) {
    const result = await db.insert(categories).values(data).returning()
    return result[0]
  }

  async update(id: string, data: Partial<typeof categories.$inferInsert>) {
    const result = await db
      .update(categories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning()
    return result[0] || null
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning()
    return result.length > 0
  }
}

export const categoriesRepository = new CategoriesRepository()
