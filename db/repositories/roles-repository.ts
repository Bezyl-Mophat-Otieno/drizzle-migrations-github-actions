import { db } from '@/db'
import { Permission, permissions } from '@/db/schema/permissions'
import { roles } from '@/db/schema/roles'
import { rolesPermissions } from '@/db/schema/roles-permissions'
import type { NewRole, Role } from '@/types/rbac'
import { getPermissionName } from '@/types/rbac'
import { eq, inArray, sql } from 'drizzle-orm'
import { BaseRepository } from './base-repository'

export class RolesRepository extends BaseRepository<Role | NewRole | null> {
  tableName = 'roles'
  async findAll(includePermissions = false): Promise<Role[]> {
    try {
      if (!includePermissions) {
        return await db.select().from(roles).orderBy(roles.name)
      }

      // Fetch roles with their permissions
      const result = await db
        .select({
          role: roles,
          permission: permissions,
        })
        .from(roles)
        .leftJoin(rolesPermissions, eq(roles.roleId, rolesPermissions.roleId))
        .leftJoin(permissions, eq(rolesPermissions.permissionId, permissions.id))
        .orderBy(roles.name)

      // Group permissions by role
      const rolesMap = new Map<number, Role>()

      for (const row of result) {
        if (!rolesMap.has(row.role.roleId)) {
          rolesMap.set(row.role.roleId, {
            ...row.role,
            permissions: [],
          })
        }

        if (row.permission) {
          const role = rolesMap.get(row.role.roleId)!
          role.permissions!.push({
            ...row.permission,
            name: getPermissionName(row.permission),
          })
        }
      }

      return Array.from(rolesMap.values())
    } catch (error) {
      this.handleError('Failed to fetch roles', error)
    }
  }

  async findById(id: number, includePermissions = false): Promise<Role | null> {
    try {
      const roleResult = await db.select().from(roles).where(eq(roles.roleId, id)).limit(1)

      if (roleResult.length === 0) return null

      const role = roleResult[0]

      if (!includePermissions) {
        return role
      }

      // Fetch permissions for this role
      const permissionsResult = await db
        .select({ permission: permissions })
        .from(rolesPermissions)
        .innerJoin(permissions, eq(rolesPermissions.permissionId, permissions.id))
        .where(eq(rolesPermissions.roleId, id))

      return {
        ...role,
        permissions: permissionsResult.map((p) => ({
          ...p.permission,
          name: getPermissionName(p.permission),
        })),
      }
    } catch (error) {
      this.handleError('Failed to fetch role', error)
    }
  }

  async findByName(name: string): Promise<Role | null> {
    try {
      const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1)

      return result.length > 0 ? result[0] : null
    } catch (error) {
      this.handleError('Failed to fetch role by name', error)
    }
  }

  async create(data: NewRole): Promise<Role | null> {
    try {
      return await db.transaction(async (tx) => {
        // Create the role
        const roleResult = await tx
          .insert(roles)
          .values({
            name: data.name,
            description: data.description || null,
          })
          .returning()

        const role = roleResult[0]

        if(!role) return null

        // Assign permissions if provided
        if (data.permissionIds && data.permissionIds.length > 0) {
          await tx.insert(rolesPermissions).values(
            data.permissionIds.map((permissionId) => ({
              roleId: role.roleId,
              permissionId,
            }))
          ).returning()
                                    
        }

        // Fetch permissions for this role
          const permissionsResult = await tx
          .select({ permission: permissions })
          .from(rolesPermissions)
          .innerJoin(permissions, eq(rolesPermissions.permissionId, permissions.id))
          .where(eq(rolesPermissions.roleId, role.roleId))

          return {
          ...role,
          permissions: permissionsResult.map((p) => ({
            ...p.permission,
            name: getPermissionName(p.permission),
          })),
        }
      })
    } catch (error) {
      this.handleError('Failed to create role', error)
    }
  }

  async update(id: number, data: Partial<NewRole>): Promise<Role | null> {
    try {
      return await db.transaction(async (tx) => {
        // Update role basic info
        const roleResult = await tx
          .update(roles)
          .set({
            name: data.name,
            description: data.description,
            updatedAt: new Date(),
          })
          .where(eq(roles.roleId, id))
          .returning()

        if (roleResult.length === 0) return null

        const role = roleResult[0]

        // Update permissions if provided
        if (data.permissionIds !== undefined) {
          // Remove existing permissions
          await tx.delete(rolesPermissions).where(eq(rolesPermissions.roleId, id))

          // Add new permissions
          if (data.permissionIds.length > 0) {
            await tx.insert(rolesPermissions).values(
              data.permissionIds.map((permissionId) => ({
                roleId: id,
                permissionId,
              }))
            )
          }
        }

          // Fetch permissions for this role
          const permissionsResult = await db
          .select({ permission: permissions })
          .from(rolesPermissions)
          .innerJoin(permissions, eq(rolesPermissions.permissionId, permissions.id))
          .where(eq(rolesPermissions.roleId, role.roleId))

          return {
          ...role,
          permissions: permissionsResult.map((p) => ({
            ...p.permission,
            name: getPermissionName(p.permission),
          })),
        }

      })
    } catch (error) {
      this.handleError('Failed to update role', error)
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await db.delete(roles).where(eq(roles.roleId, id)).returning({ id: roles.roleId })

      return result.length > 0
    } catch (error) {
      this.handleError('Failed to delete role', error)
    }
  }

  async addPermissions(roleId: number, permissionIds: string[]): Promise<void> {
    try {
      if (permissionIds.length === 0) return

      await db
        .insert(rolesPermissions)
        .values(
          permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          }))
        )
        .onConflictDoNothing()
    } catch (error) {
      this.handleError('Failed to add permissions to role', error)
    }
  }

  async removePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      if (permissionIds.length === 0) return

      await db
        .delete(rolesPermissions)
        .where(sql`${rolesPermissions.roleId} = ${roleId} AND ${rolesPermissions.permissionId} = ANY(${permissionIds})`)
    } catch (error) {
      this.handleError('Failed to remove permissions from role', error)
    }
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    try {
      const result = await db
        .select({ permission: permissions })
        .from(rolesPermissions)
        .innerJoin(permissions, eq(rolesPermissions.permissionId, permissions.id))
        .where(eq(rolesPermissions.roleId, roleId))

      return result.map((p) => ({
        ...p.permission,
        name: getPermissionName(p.permission),
      }))
    } catch (error) {
      this.handleError('Failed to fetch role permissions', error)
    }
  }
}
