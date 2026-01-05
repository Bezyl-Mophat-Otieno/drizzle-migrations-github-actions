import { z } from 'zod'

export interface UpiPrefix {
  id: string
  companyId: string
  prefix: string
  type: 'UPI7' | 'UPI11' | 'UPI13'
  isActive: boolean
  maxProducts: number
  usedCount: number
  nextSequenceNumber: number
  createdAt: Date
  updatedAt: Date
}

export interface NewUpiPrefix {
  companyId: string
  prefix: string
  type: 'UPI7' | 'UPI11' | 'UPI13'
  isActive?: boolean
}

export interface UpiPrefixWithCapacity extends UpiPrefix {
  remainingCapacity: number
  capacityPercentage: number
}

export interface CreateUpiPrefixRequest {
  companyId: string
  prefix: string
  type: 'UPI7' | 'UPI11' | 'UPI13'
  isActive?: boolean
}

export interface UpdateUpiPrefixRequest {
  prefix?: string
  type?: 'UPI7' | 'UPI11' | 'UPI13'
}

export interface UpiCapacityReport {
  summary: {
    totalPrefixes: number
    activePrefixes: number
    totalCapacity: number
    totalUsed: number
    averageUtilization: number
    totalBarcodes: number
    activeBarcodes: number
    deletedBarcodes: number
  }
  upiPrefixes: UpiPrefixWithCapacity[]
  barcodesByPrefix: Array<{
    prefixId: string
    prefix: string
    type: string
    count: number
  }>
}

export interface UpiApiResponse {
  success: boolean
  message: string
  data?: UpiPrefix | UpiPrefixWithCapacity | UpiPrefixWithCapacity[] | UpiCapacityReport
  errors?: any[]
}

// UPI Type constants
export const UPI_TYPES = ['UPI7', 'UPI11', 'UPI13'] as const
export type UpiType = (typeof UPI_TYPES)[number]

// Validation schemas
export const createUpiPrefixSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  prefix: z.string().min(4, 'Prefix must be at least 4 characters').max(12, 'Prefix cannot exceed 12 characters'),
  type: z.enum(['UPI7', 'UPI11', 'UPI13'], { required_error: 'UPI type is required' }),
  isActive: z.boolean().optional().default(false),
})

export const updateUpiPrefixSchema = z.object({
  prefix: z.string().min(4).max(12).optional(),
  type: z.enum(['UPI7', 'UPI11', 'UPI13']).optional(),
})

export const upiSearchSchema = z.object({
  companyId: z.string().uuid().optional(),
  type: z.enum(['UPI7', 'UPI11', 'UPI13']).optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
})

// Helper functions
export function calculateMaxProducts(type: UpiType, prefixLength: number): number {
  switch (type) {
    case 'UPI13':
      switch (prefixLength) {
        case 4:
          return 99999999
        case 5:
          return 9999999
        case 6:
          return 999999
        case 7:
          return 99999
        case 8:
          return 9999
        case 9:
          return 999
        case 10:
          return 99
        case 11:
          return 9
        default:
          return 0
      }
    case 'UPI11':
      switch (prefixLength) {
        case 4:
          return 999999
        case 5:
          return 99999
        case 6:
          return 9999
        case 7:
          return 999
        case 8:
          return 99
        case 9:
          return 9
        default:
          return 0
      }
    case 'UPI7':
      switch (prefixLength) {
        case 4:
          return 99
        case 5:
          return 9
        default:
          return 0
      }
    default:
      return 0
  }
}

export function validatePrefixLength(type: UpiType, prefixLength: number): boolean {
  switch (type) {
    case 'UPI13':
      return prefixLength >= 4 && prefixLength <= 11
    case 'UPI11':
      return prefixLength >= 4 && prefixLength <= 9
    case 'UPI7':
      return prefixLength >= 4 && prefixLength <= 5
    default:
      return false
  }
}
