import { z } from 'zod'

export interface Barcode {
  id: string
  productId: string
  upiPrefixId: string
  sequenceNumber: string
  barcodeNumber: string
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NewBarcode {
  productId: string
  upiPrefixId: string
  sequenceNumber: string
  barcodeNumber: string
}

export interface BarcodeWithDetails extends Barcode {
  product?: {
    id: string
    name: string
    companyId: string
  }
  upiPrefix?: {
    id: string
    prefix: string
    type: string
  }
}

export interface BarcodeGenerationRequest {
  productId: string
}

export interface BarcodeApiResponse {
  success: boolean
  message: string
  data?: Barcode | BarcodeWithDetails
  errors?: any[]
}

export interface BarcodeCapacityReport {
  totalBarcodes: number
  activeBarcodes: number
  deletedBarcodes: number
  barcodesByPrefix: Array<{
    prefixId: string
    prefix: string
    type: string
    count: number
  }>
}

// Validation schemas
export const generateBarcodeSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
})

export const barcodeLookupSchema = z.object({
  barcode: z.string().min(7).max(13).regex(/^\d+$/, 'Barcode must contain only digits'),
})

// Barcode validation result
export interface BarcodeValidationResult {
  isValid: boolean
  type?: 'UPI7' | 'UPI11' | 'UPI13'
  prefix?: string
  sequenceNumber?: string
  checksum?: string
  error?: string
}
