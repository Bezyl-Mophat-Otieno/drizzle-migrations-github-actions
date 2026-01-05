import { z } from "zod"
import type { Product } from "../db/schema/products"
export const UNITS_OF_MEASUREMENT = [
  "kg",
  "g",
  "mg",
  "lb",
  "oz",
  "l",
  "ml",
  "gal",
  "qt",
  "pt",
  "m",
  "cm",
  "mm",
  "ft",
  "in",
  "pcs",
  "units",
  "boxes",
  "packs",
  "piece",
  "pair",
  "dozen",
] as const

export const COUNTRIES = [
  "Kenya",
  "Uganda",
  "Tanzania",
  "Rwanda",
  "Burundi",
  "Ethiopia",
  "South Sudan",
  "Somalia",
  "Djibouti",
] as const

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Product name too long"),
  description: z.string().optional(),
  unitOfMeasurement: z.enum(UNITS_OF_MEASUREMENT, {
    message: "Please select a valid unit of measurement",
  }),
  netWeight: z.number().positive("Net weight must be positive"),
  countryOfSale: z.enum(COUNTRIES, {
    message: "Please select a valid country",
  }),
  size: z.string().optional(),
  color: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
})

export type CreateProductRequest = z.infer<typeof createProductSchema>

export interface ProductWithIdentifiers extends Product {
  hasBarcode: boolean
  hasQRCode: boolean
  barcodeImageUrl?: string | null
  qrCodeImageUrl?: string | null
  barcode?: {
    id: string
    barcodeNumber: string
    barcodeImageUrl: string | null
  } | null
  qrCode?: {
    id: string
    qrCodeImageUrl: string | null
  } | null
}

export interface ProductSearchFilters {
  name?: string
  countryOfIssue?: string
  color?: string
  size?: string
  companyId?: string
}

export interface BulkProductUpload {
  file: File
  products: CreateProductRequest[]
}

export interface BulkUploadResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  unitOfMeasurement?: string
  netWeight?: number
  countryOfIssue?: string
  size?: string
  color?: string
  imageUrl?: string
}

export interface AssignIdentifiersRequest {
  barcodeId?: string
  qrCodeId?: string
}

export interface ProductApiResponse {
  success: boolean
  message: string
  data?: Product | ProductWithIdentifiers | ProductWithIdentifiers[]
}

export interface ProductListResponse {
  success: boolean
  message: string
  data: {
    products: ProductWithIdentifiers[]
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number,
      totalWithBarcodes: number,
      totalWithQrcodes: number,
      totalComplete: number,
    }
  }
}

export type Country = (typeof COUNTRIES)[number]

export const assignIdentifiersSchema = z
  .object({
    barcodeId: z.uuid().optional(),
    qrCodeId: z.uuid().optional(),
  })
  .refine((data) => data.barcodeId || data.qrCodeId, {
    message: "At least one identifier (barcodeId or qrCodeId) must be provided",
  })

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  unitOfMeasurement: z.enum(UNITS_OF_MEASUREMENT).optional(),
  netWeight: z.number().positive().optional(),
  countryOfIssue: z.enum(COUNTRIES).optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
})

export const searchSchema = z.object({
  name: z.string().optional(),
  countryOfIssue: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  hasBarcode: z.string().optional(),
  hasQRCode: z.string().optional(),
  hasImage: z.string().optional(),
  companyId: z.string().optional(),
})
