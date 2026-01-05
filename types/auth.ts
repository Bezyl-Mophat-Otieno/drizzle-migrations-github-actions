import { z } from 'zod'

// User types
export interface User {
  id: string
  username: string
  email: string
  phoneNumber?: string | null
  avatar?: string | null
  status: 'pending' | 'active' | 'suspended'
  emailVerifiedAt?: Date | null
  companyId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface NewUser {
  username: string
  email: string
  phoneNumber?: string
  avatar?: string
  passwordHash: string
  status?: 'pending' | 'active' | 'suspended'
  companyId?: string
  categoryId?: string
}

// Token types
export interface VerificationToken {
  id: string
  userId: string
  token: string
  type: 'email' | 'reset'
  expiresAt: Date
  createdAt: Date
}

export interface RefreshToken {
  id: string
  userId: string
  token: string
  userAgent?: string | null
  ip?: string | null
  expiresAt: Date
  createdAt: Date
}

// JWT Payload
export interface JWTPayload {
  userId: string
  email: string
  username: string
  status: string
  companyId?: string | null
  iat?: number
  exp?: number
}

// API Request/Response types
export interface RegisterRequest {
  username: string
  email: string
  password: string
  phoneNumber?: string
  categoryId?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user?: Omit<User, 'passwordHash'>
    accessToken?: string
    refreshToken?: string
  }
}

// Validation schemas
export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(100),
  email: z.email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  phoneNumber: z.string(),
  countryCode: z.string(),
})

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
})


export const verifyEmailSchema = z.string();

export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;


export const resetPasswordRequestSchema = z.object({
  token: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;



export const fetchUserRolesPermissionRequestSchema = z.object({
  email: z.email(),
});
export type UserRolesPermissionRequest = z.infer<typeof fetchUserRolesPermissionRequestSchema>;
