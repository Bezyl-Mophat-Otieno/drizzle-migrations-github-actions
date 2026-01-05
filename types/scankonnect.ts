export interface QRCode {
  id: string
  userId: string
  slug: string
  title: string
  description?: string
  socialHandles: {
    twitter?: string
    instagram?: string
    linkedin?: string
    facebook?: string
  }
  videoLinks: string[]
  enableFeedback: boolean
  enableRating: boolean
  qrCodeUrl?: string
  status: 'active' | 'inactive' | 'expired'
  createdAt: string
  updatedAt: string
}

export interface QRFile {
  id: string
  qrCodeId: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  thumbnailUrl?: string
  createdAt: string
}

export interface QRCodeSubscription {
  id: string
  qrCodeId: string
  userId: string
  planType: 'basic' | 'pro' | 'business'
  amount: number
  currency: string
  transactionId?: string
  validFrom: string
  validUntil: string
  status: 'active' | 'expired' | 'cancelled'
  createdAt: string
}

export interface QRScanLog {
  id: string
  qrCodeId: string
  ipAddress?: string
  userAgent?: string
  referer?: string
  deviceType?: 'mobile' | 'desktop' | 'tablet'
  location?: {
    country?: string
    city?: string
    region?: string
  }
  scannedAt: string
}

export interface QRFeedback {
  id: string
  qrCodeId: string
  feedbackText: string
  isAnonymous: boolean
  createdAt: string
}

export interface QRRating {
  id: string
  qrCodeId: string
  rating: number
  ipAddress?: string
  createdAt: string
}

export interface QRCodeAnalytics {
  totalScans: number
  uniqueScans: number
  scansByDay: { date: string; scans: number }[]
  deviceDistribution: { device: string; count: number }[]
  locationDistribution: { location: string; count: number }[]
  averageRating: number
  totalRatings: number
  recentFeedback: QRFeedback[]
}

