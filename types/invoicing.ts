export interface Invoice {
  id: string
  invoiceNumber: string
  userId: string
  serviceType: 'scankonnect' | 'barcode' | 'qr_code'
  serviceId?: string
  amount: number
  currency: string
  paymentReference?: string
  status: 'generated' | 'sent' | 'downloaded'
  pdfUrl?: string
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface EmailLog {
  id: string
  userId: string
  emailType: 'invoice' | 'reminder_30d' | 'reminder_7d' | 'reminder_1d'
  serviceType?: string
  serviceId?: string
  recipientEmail: string
  subject: string
  sentAt: Date
  status: 'sent' | 'failed' | 'bounced'
  errorMessage?: string
}

export interface SubscriptionReminder {
  id: string
  userId: string
  subscriptionId: string
  serviceType: string
  reminderType: '30d' | '7d' | '1d'
  sentAt: Date
  expiryDate: Date
}

export interface InvoiceData {
  customerName: string
  customerEmail: string
  serviceType: string
  serviceDescription: string
  amount: number
  currency: string
  paymentReference: string
  invoiceNumber: string
  invoiceDate: Date
}

export interface ReminderEmailData {
  customerName: string
  customerEmail: string
  serviceType: string
  serviceName: string
  expiryDate: Date
  daysUntilExpiry: number
  renewalUrl: string
}
