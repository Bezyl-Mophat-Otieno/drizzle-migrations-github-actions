import { z } from 'zod'

// Permission types
export interface Permission {
  id: string
  module: string
  submodule?: string | null
  action: string
  description?: string | null
  name: string // computed field
  createdAt: Date
  updatedAt: Date
}

export interface NewPermission {
  module: string
  submodule?: string
  action: string
  description?: string
}

// Role types
export interface Role {
  roleId: number
  name: string
  description?: string | null
  createdAt: Date
  updatedAt: Date
  permissions?: Permission[]
}

export interface NewRole {
  name: string
  description?: string
  permissionIds?: string[]
}

// User role assignment types
export interface UserRole {
  id: string
  userId: string
  roleId: number
  assignedAt: Date
  role?: Role
}

// API Request/Response types
export interface CreatePermissionRequest {
  module: string
  submodule?: string
  action: string
  description?: string
}

export interface UpdatePermissionRequest {
  module?: string
  submodule?: string
  action?: string
  description?: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissionIds?: string[]
}

export interface AssignRoleRequest {
  roleId: number
}

export interface RBACResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// Validation schemas
export const createPermissionSchema = z.object({
  module: z.string().min(1, 'Module is required').max(50),
  submodule: z.string().max(50).optional(),
  action: z.string().min(1, 'Action is required').max(50),
  description: z.string().optional(),
})

export const updatePermissionSchema = z.object({
  module: z.string().min(1).max(50).optional(),
  submodule: z.string().max(50).optional(),
  action: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
})

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50),
  description: z.string().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
})

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string().uuid()).optional(),
})

export const assignRoleSchema = z.object({
  roleId: z.number().int().positive('Invalid role ID'),
})

// Utility functions
export function getPermissionName(permission: { module: string; submodule?: string | null; action: string }): string {
  return permission.submodule
    ? `${permission.module}.${permission.submodule}.${permission.action}`
    : `${permission.module}.${permission.action}`
}

export function parsePermissionName(name: string): { module: string; submodule?: string; action: string } {
  const parts = name.split('.')
  if (parts.length === 2) {
    return { module: parts[0], action: parts[1] }
  } else if (parts.length === 3) {
    return { module: parts[0], submodule: parts[1], action: parts[2] }
  }
  throw new Error(`Invalid permission name format: ${name}`)
}
