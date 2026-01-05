import { z } from 'zod'

export interface QrCode {
  id: string
  productId: string
  qrCodeImageUrl: string
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NewQrCode {
  productId: string
  qrCodeImageUrl: string
}

export interface QrCodeWithProduct extends QrCode {
  product?: {
    id: string
    name: string
    companyId: string
  }
}

export interface QrCodeGenerationRequest {
  data?: string
  options?: {
    size?: number
    margin?: number
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  }
}

export interface QrCodeApiResponse {
  success: boolean
  message: string
  data?: QrCode | QrCodeWithProduct
  errors?: any[]
}

// Validation schemas
export const generateQrCodeSchema = z.object({
  data: z.string().optional(),
  options: z
    .object({
      size: z.number().min(100).max(1000).optional(),
      margin: z.number().min(0).max(10).optional(),
      errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).optional(),
    })
    .optional(),
})
