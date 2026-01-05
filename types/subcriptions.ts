import { z } from 'zod'
// Zod schemas for validation

export const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
})

export const planSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  maintenanceFee: z.number().min(0, 'Maintenance fee must be positive'),
  codeFee: z.number().min(0, 'Code fee must be positive'),
  billingCycle: z.enum(['monthly', 'yearly']),
  usageLimit: z.number().min(1, 'Usage limit must be at least 1'),
})

export const subscriptionSchema = z.object({
  companyId: z.string().uuid('Invalid company ID'),
  planId: z.string().uuid('Invalid plan ID'),
  status: z.enum(['active', 'canceled', 'expired']).default('active'),
  startDate: z.string(),
  endDate: z.string().optional(),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  nextBillingDate: z.string(),
})
