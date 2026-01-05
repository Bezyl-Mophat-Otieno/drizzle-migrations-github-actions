import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { RolesPermissions, rolesPermissions } from '@/db/schema/roles-permissions'
import { permissions } from '@/db/schema/permissions'
import { BaseRepository } from './base-repository'
import type { Permission } from '@/types/rbac'
import { getPermissionName } from '@/types/rbac'

export class RolesPermissionsRepository extends BaseRepository<RolesPermissions> {

  tableName = 'roles_permissions'

  async addPermission(roleId: string, permissionId: string): Promise<void> {
    try {
      await db
        .insert(rolesPermissions)
        .values({ roleId, permissionId })
        .onConflictDoNothing()
    } catch (error) {
      this.handleError('Failed to add permission to role', error)
    }
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    try {
      await db
        .delete(rolesPermissions)
        .where(sql`${rolesPermissions.roleId} = ${roleId} AND ${rolesPermissions.permissionId} = ${permissionId}`)
    } catch (error) {
      this.handleError('Failed to remove permission from role', error)
    }
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
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

  async getRolesByPermission(permissionId: string) {
    try {
      return await db
        .select({ roleId: rolesPermissions.roleId })
        .from(rolesPermissions)
        .where(eq(rolesPermissions.permissionId, permissionId))
    } catch (error) {
      this.handleError('Failed to fetch roles by permission', error)
    }
  }

findById(id: string): Promise<{ id: string; createdAt: Date; roleId: string; permissionId: string } | undefined> {
    throw new Error('Method not implemented.')
}
findAll(): Promise<{ id: string; createdAt: Date; roleId: string; permissionId: string }[]> {
    throw new Error('Method not implemented.')
}
create(entity: { id: string; createdAt: Date; roleId: string; permissionId: string }): Promise<{ id: string; createdAt: Date; roleId: string; permissionId: string } | undefined> {
    throw new Error('Method not implemented.')
}
update(id: string, entity: Partial<{ id: string; createdAt: Date; roleId: string; permissionId: string }>): Promise<{ id: string; createdAt: Date; roleId: string; permissionId: string }> {
    throw new Error('Method not implemented.')
}
delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.')
}
}

export const rolesPermissionsRepository = new RolesPermissionsRepository()
