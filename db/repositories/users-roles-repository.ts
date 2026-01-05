import { db } from '@/db'
import { permissions } from '@/db/schema/permissions'
import { roles } from '@/db/schema/roles'
import { rolesPermissions } from '@/db/schema/roles-permissions'
import { usersRoles } from '@/db/schema/users-roles'
import type { Permission, UserRole } from '@/types/rbac'
import { getPermissionName } from '@/types/rbac'
import { eq, sql } from 'drizzle-orm'
import { BaseRepository } from './base-repository'

export class UsersRolesRepository extends BaseRepository<UserRole> {
  tableName = 'users_roles'
  async findUserRoles(userId: string) {
    try {
      const result = await db
        .select({
          userRole: usersRoles,
          role: roles,
        })
        .from(usersRoles)
        .innerJoin(roles, eq(usersRoles.roleId, roles.roleId))
        .where(eq(usersRoles.userId, userId))
        .orderBy(roles.name)

      return result.map((r) => ({
        ... r.role,
      }))
    } catch (error) {
      this.handleError('Failed to fetch user roles', error)
    }
  }

  async findUserPermissions(userId: string): Promise<Permission[]> {
    try {
      const result = await db
        .select({ permission: permissions })
        .from(usersRoles)
        .innerJoin(rolesPermissions, eq(usersRoles.roleId, rolesPermissions.roleId))
        .innerJoin(permissions, eq(rolesPermissions.permissionId, permissions.id))
        .where(eq(usersRoles.userId, userId))

      // Remove duplicates and return unique permissions
      const uniquePermissions = new Map<string, Permission>()

      for (const p of result) {
        const permission = {
          ...p.permission,
          name: getPermissionName(p.permission),
        }
        uniquePermissions.set(permission.id, permission)
      }

      return Array.from(uniquePermissions.values())
    } catch (error) {
      this.handleError('Failed to fetch user permissions', error)
    }
  }

  async getUserPermissionNames(userId: string): Promise<string[]> {
    try {
      const permissions = await this.findUserPermissions(userId)
      return permissions.map((p) => p.name)
    } catch (error) {
      this.handleError('Failed to fetch user permission names', error)
    }
  }

  async assignRole(userId: string, roleId: number): Promise<UserRole> {
    try {
      const result = await db
        .insert(usersRoles)
        .values({
          userId,
          roleId,
        })
        .returning()

      return result[0]
    } catch (error) {
      this.handleError('Failed to assign role to user', error)
    }
  }

  async removeRole(userId: string, roleId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(usersRoles)
        .where(sql`${usersRoles.userId} = ${userId} AND ${usersRoles.roleId} = ${roleId}`)
        .returning({ id: usersRoles.id })

      return result.length > 0
    } catch (error) {
      this.handleError('Failed to remove role from user', error)
    }
  }

  async removeAllUserRoles(userId: string): Promise<void> {
    try {
      await db.delete(usersRoles).where(eq(usersRoles.userId, userId))
    } catch (error) {
      this.handleError('Failed to remove all user roles', error)
    }
  }

  async hasRole(userId: string, roleId: number): Promise<boolean> {
    try {
      const result = await db
        .select({ id: usersRoles.id })
        .from(usersRoles)
        .where(sql`${usersRoles.userId} = ${userId} AND ${usersRoles.roleId} = ${roleId}`)
        .limit(1)

      return result.length > 0
    } catch (error) {
      this.handleError('Failed to check user role', error)
    }
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      const permissionNames = await this.getUserPermissionNames(userId)
      return permissionNames.includes(permissionName)
    } catch (error) {
      this.handleError('Failed to check user permission', error)
    }
  }

  async findRoleUsers(roleId: number): Promise<string[]> {
    try {
      const result = await db
        .select({ userId: usersRoles.userId })
        .from(usersRoles)
        .where(eq(usersRoles.roleId, roleId))

      return result.map((r) => r.userId)
    } catch (error) {
      this.handleError('Failed to fetch role users', error)
    }
  }
  async findById(id: string): Promise<UserRole | undefined> {
    try {
      const [result] = await db.select().from(usersRoles).where(eq(usersRoles.id, id)).limit(1)

      return result
    } catch (error) {
      this.handleError('Failed to find user role by ID', error)
    }
  }

  async findAll(): Promise<UserRole[]> {
    try {
      const result = await db.select().from(usersRoles).orderBy(usersRoles.id)
      return result
    } catch (error) {
      this.handleError('Failed to fetch all user roles', error)
    }
  }

  async create(entity: UserRole): Promise<UserRole | undefined> {
    try {
      const [result] = await db.insert(usersRoles).values(entity).returning()
      return result
    } catch (error) {
      this.handleError('Failed to create user role', error)
    }
  }

  async update(id: string, entity: Partial<UserRole>): Promise<UserRole> {
    try {
      const [result] = await db
        .update(usersRoles)
        .set({ ...entity })
        .where(eq(usersRoles.id, id))
        .returning()

      return result
    } catch (error) {
      this.handleError('Failed to update user role', error)
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const [result] = await db.delete(usersRoles).where(eq(usersRoles.id, id)).returning({ id: usersRoles.id })

      return !!result
    } catch (error) {
      this.handleError('Failed to delete user role', error)
      return false
    }
  }
}
