import './envConfig'
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().min(1),
  // DigitalOcean Spaces configuration
  DO_SPACES_KEY: z.string().min(1),
  DO_SPACES_SECRET: z.string().min(1),
  DO_SPACES_ENDPOINT: z.url(),
  DO_SPACES_BUCKET: z.string().min(1),
  // Gmail SMTP
  GMAIL_USER: z.email().min(1),
  NEXT_PUBLIC_SYSTEM_EMAIL: z.email().min(1),
  NEXT_PUBLIC_SYSTEM_NAME: z.string().min(1),
  GMAIL_APP_PASSWORD: z.string().min(1),

})

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SYSTEM_EMAIL: process.env.NEXT_PUBLIC_SYSTEM_EMAIL,
  NEXT_PUBLIC_SYSTEM_NAME: process.env.NEXT_PUBLIC_SYSTEM_NAME,
  DO_SPACES_KEY: process.env.DO_SPACES_KEY,
  DO_SPACES_SECRET: process.env.DO_SPACES_SECRET,
  DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT,
  DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
})
