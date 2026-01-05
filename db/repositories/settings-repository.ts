// db/repositories/settings-repository.ts
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { settings } from '@/db/schema/settings'
import { BaseRepository } from './base-repository'
import type { Setting, NewSetting } from '@/types/settings'

export class SettingsRepository extends BaseRepository<Setting | NewSetting | null> {
  tableName = 'settings'

  async findById(id: string): Promise<Setting | undefined> {
    try {
      const [result] = await db.select().from(settings).where(eq(settings.id, id)).limit(1)
      return result
    } catch (error) {
      this.handleError('findById', error)
    }
  }

  async findAll(): Promise<Setting[]> {
    try {
      return await db.select().from(settings)
    } catch (error) {
      this.handleError('findAll', error)
    }
  }

  async create(data: NewSetting): Promise<Setting | undefined> {
    try {
      const [created] = await db
        .insert(settings)
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

  async update(id: string, data: Partial<NewSetting>): Promise<Setting> {
    try {
      const [updated] = await db
        .update(settings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(settings.id, id))
        .returning()
      return updated
    } catch (error) {
      this.handleError('update', error)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const [deleted] = await db.delete(settings).where(eq(settings.id, id)).returning()
      return !!deleted
    } catch (error) {
      this.handleError('delete', error)
    }
  }

  async getSetting(key: string): Promise<string | null> {
    try {
      const [setting] = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
      return setting?.value ?? null
    } catch (error) {
      this.handleError('getSetting', error)
    }
  }

  async getSettings(category?: string): Promise<Setting[]> {
    try {
      const query = db.select().from(settings)
      return category ? await query.where(eq(settings.category, category)) : await query
    } catch (error) {
      this.handleError('getSettings', error)
    }
  }

  async updateSetting(key: string, value: string): Promise<void> {
    try {
      await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key))
    } catch (error) {
      this.handleError('updateSetting', error)
    }
  }

  async upsertSetting(key: string, value: string, description?: string, category?: string): Promise<void> {
    const existing = await this.getSetting(key)

    if (existing !== null) {
      await this.updateSetting(key, value)
    } else {
      await this.create({
        key,
        value,
        description,
        category: category || 'general',
      })
    }
  }

  async getMaintenanceStatus(): Promise<{ enabled: boolean; message: string }> {
    try {
      const [enabled, message] = await Promise.all([
        this.getSetting('maintenance_mode'),
        this.getSetting('maintenance_message'),
      ])

      return {
        enabled: enabled === 'true',
        message: message || 'System maintenance in progress. Please check back later.',
      }
    } catch (error) {
      return {
        enabled: false,
        message: 'System maintenance in progress. Please check back later.',
      }
    }
  }
}

export const settingsRepository = new SettingsRepository()
