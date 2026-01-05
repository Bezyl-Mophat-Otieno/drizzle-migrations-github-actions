import { z } from "zod"

export interface Company {
  id: string
  userId: string
  categoryId: string
  name: string
  email: string
  physicalAddress: string
  country: string
  websiteUrl?: string | null
  logoUrl?: string | null
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

export interface NewCompany {
  userId: string
  categoryId: string
  name: string
  email: string
  physicalAddress: string
  country: string
  websiteUrl?: string | null
  logoUrl?: string | null
  status?: "active" | "inactive"
}

export const companySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  physicalAddress: z.string(),
  country: z.string(),
  websiteUrl: z.string().optional().or(z.literal("")),
  logoUrl: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
})

export interface CompanyDocument {
  id: string
  companyId: string
  name: string
  fileUrl: string
  status: "accepted" | "declined" | "pending"
  createdAt: Date
  updatedAt: Date
}

export interface NewCompanyDocument {
  companyId: string
  name: string
  fileUrl: string
  status?: "accepted" | "declined" | "pending"
}

export const documentSchema = z.array(z.object({
  name: z.string().min(3),
  fileUrl: z.string().url(),
}))

export type CompanyDirector = {
  id: string
  companyId: string
  name: string
  email: string
  phoneNumber: string
  createdAt: Date
  updatedAt: Date
}

export type NewCompanyDirector = Omit<CompanyDirector, "id" | "createdAt" | "updatedAt">

export const directorSchema = z.array(
  z.object({
  name: z.string().min(3),
  email: z.email(),
  phoneNumber: z.string().min(7),
}))

export type Sector = {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export type NewSector = {
  name: string
  description?: string
}

export const sectorSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
})

export type CompanySector = {
  companyId: string
  sectorId: string
  createdAt: Date
}
