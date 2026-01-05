export type Setting = {
  id: string
  key: string
  value: string
  description?: string | null
  category?: string | null
  createdAt: Date
  updatedAt: Date
}

export type NewSetting = Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>
