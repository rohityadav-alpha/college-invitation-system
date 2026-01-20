// src/lib/types.ts

export interface EmailLog {
  id: string
  status: string
  sentAt: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  errorMessage?: string
  messageId?: string
  recipientType?: string
  student?: {
    id: string
    name: string
    email: string
    course: string
    year: string
  }
  guest?: {
    id: string
    name: string
    email: string
    organization: string
    designation: string
  }
  professor?: {
    id: string
    name: string
    email: string
    college: string
    department: string
  }
}

export interface SmsLog {
  id: string
  status: string
  sentAt: string
  deliveredAt?: string
  errorMessage?: string
  messageId?: string
  recipientType?: string
  student?: {
    id: string
    name: string
    phone: string
    course: string
    year: string
  }
  guest?: {
    id: string
    name: string
    phone: string
    organization: string
    designation: string
  }
  professor?: {
    id: string
    name: string
    phone: string
    college: string
    department: string
  }
}

export interface WhatsappLog {
  id: string
  status: string
  sentAt: string
  deliveredAt?: string
  readAt?: string
  errorMessage?: string
  messageId?: string
  recipientType?: string
  student?: {
    id: string
    name: string
    phone: string
    course: string
    year: string
  }
  guest?: {
    id: string
    name: string
    phone: string
    organization: string
    designation: string
  }
  professor?: {
    id: string
    name: string
    phone: string
    college: string
    department: string
  }
}

export interface Invitation {
  id: string
  title: string
  subject: string
  content: string
  createdAt: Date
  sentCount: number
  emailLogs: EmailLog[]
  smsLogs: SmsLog[]
  whatsappLogs: WhatsappLog[]
  analytics?: {
    totalSent: number
    delivered: number
    opened: number
    clicked: number
    failed: number
    pending: number
    deliveryRate: string
    openRate: string
  }
}

export interface Student {
  id: string
  name: string
  email: string
  phone?: string
  course: string
  year: string
  createdAt: Date
}

export interface Guest {
  id: string
  name: string
  email: string
  phone?: string
  organization: string
  designation: string
  createdAt: Date
}

export interface Professor {
  id: string
  name: string
  email: string
  phone?: string
  college: string
  department: string
  createdAt: Date
}

export interface EmailRecipient {
  to: string
  name: string
  type?: 'student' | 'guest' | 'professor'
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  details?: any
}

export interface InvitationFormData {
  title: string
  subject: string
  content: string
  recipients: {
    students: string[]
    guests: string[]
    professors: string[]
  }
}

export interface MessageStatus {
  id: string
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed'
  timestamp: Date
  error?: string
}
