import { eq, and, sql } from 'drizzle-orm'
import { db } from '@/db'
import { permissions } from '@/db/schema/permissions'
import { BaseRepository } from './base-repository'
import type { Permission, NewPermission } from '@/types/rbac'
import { getPermissionName } from '@/types/rbac'

export class PermissionsRepository extends BaseRepository<Permission | NewPermission | null> {
  tableName = 'permissions'
  async findAll(): Promise<Permission[]> {
    try {
      const result = await db
        .select({
          id: permissions.id,
          module: permissions.module,
          submodule: permissions.submodule,
          action: permissions.action,
          description: permissions.description,
          createdAt: permissions.createdAt,
          updatedAt: permissions.updatedAt,
        })
        .from(permissions)
        .orderBy(permissions.module, permissions.submodule, permissions.action)

      return result.map((p) => ({
        ...p,
        name: getPermissionName(p),
      }))
    } catch (error) {
      this.handleError('Failed to fetch permissions', error)
    }
  }

  async findById(id: string): Promise<Permission | null> {
    try {
      const result = await db.select().from(permissions).where(eq(permissions.id, id)).limit(1)

      if (result.length === 0) return null

      const permission = result[0]
      return {
        ...permission,
        name: getPermissionName(permission),
      }
    } catch (error) {
      this.handleError('Failed to fetch permission', error)
    }
  }

  async findByName(name: string): Promise<Permission | null> {
    try {
      // Parse the permission name to get module, submodule, action
      const parts = name.split('.')
      let module: string, submodule: string | undefined, action: string

      if (parts.length === 2) {
        ;[module, action] = parts
      } else if (parts.length === 3) {
        ;[module, submodule, action] = parts
      } else {
        return null
      }

      const result = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.module, module),
            submodule ? eq(permissions.submodule, submodule) : sql`${permissions.submodule} IS NULL`,
            eq(permissions.action, action)
          )
        )
        .limit(1)

      if (result.length === 0) return null

      const permission = result[0]
      return {
        ...permission,
        name: getPermissionName(permission),
      }
    } catch (error) {
      this.handleError('Failed to fetch permission by name', error)
    }
  }

  async create(data: NewPermission): Promise<Permission> {
    try {
      const result = await db
        .insert(permissions)
        .values({
          module: data.module,
          submodule: data.submodule || null,
          action: data.action,
          description: data.description || null,
        })
        .returning()

      const permission = result[0]
      return {
        ...permission,
        name: getPermissionName(permission),
      }
    } catch (error) {
      this.handleError('Failed to create permission', error)
    }
  }

  async update(id: string, data: Partial<NewPermission>): Promise<Permission | null> {
    try {
      const result = await db
        .update(permissions)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(permissions.id, id))
        .returning()

      if (result.length === 0) return null

      const permission = result[0]
      return {
        ...permission,
        name: getPermissionName(permission),
      }
    } catch (error) {
      this.handleError('Failed to update permission', error)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await db.delete(permissions).where(eq(permissions.id, id)).returning({ id: permissions.id })

      return result.length > 0
    } catch (error) {
      this.handleError('Failed to delete permission', error)
    }
  }

  async findByModule(module: string): Promise<Permission[]> {
    try {
      const result = await db
        .select()
        .from(permissions)
        .where(eq(permissions.module, module))
        .orderBy(permissions.submodule, permissions.action)

      return result.map((p) => ({
        ...p,
        name: getPermissionName(p),
      }))
    } catch (error) {
      this.handleError('Failed to fetch permissions by module', error)
    }
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    try {
      if (ids.length === 0) return []

      const result = await db
        .select()
        .from(permissions)
        .where(sql`${permissions.id} = ANY(${ids})`)

      return result.map((p) => ({
        ...p,
        name: getPermissionName(p),
      }))
    } catch (error) {
      this.handleError('Failed to fetch permissions by IDs', error)
    }
  }
}

export const permissionsRepository = new PermissionsRepository()
