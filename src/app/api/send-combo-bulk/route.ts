import { NextRequest, NextResponse } from 'next/server'

// Build-safe configuration - prevents execution during build time
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Type definitions
interface Recipient {
  id: string
  name: string
  email: string
  phone?: string
}

interface ComboRequest {
  emailSubject?: string
  emailContent?: string
  whatsappMessage?: string
  smsMessage?: string
  studentIds?: string[]
  guestIds?: string[]
  professorIds?: string[]
  invitationTitle?: string
  sendMethod?: 'email' | 'whatsapp' | 'sms' | 'combo'
}

// Dynamic service initialization to prevent build-time errors
let servicesInitialized = false
let prisma: any = null
let sgMail: any = null
let nodemailer: any = null

const initializeServices = async () => {
  if (servicesInitialized) return
  
  try {
    // Import Prisma dynamically
    if (!prisma) {
      const { prisma: p } = await import('@/lib/prisma')
      prisma = p
    }

    // Initialize email services if environment variables exist
    if (process.env.SENDGRID_API_KEY && !sgMail) {
      try {
        const sg = await import('@sendgrid/mail')
        sgMail = sg.default
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      } catch (error) {
        console.log('SendGrid not available:', error)
      }
    }

    // Fallback to Nodemailer if SendGrid not available
    if (!sgMail && process.env.SMTP_HOST && !nodemailer) {
      try {
        const nm = await import('nodemailer')
        nodemailer = nm.default.createTransporter({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
      } catch (error) {
        console.log('Nodemailer not available:', error)
      }
    }

    servicesInitialized = true
  } catch (error) {
    console.error('Service initialization error:', error)
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Send Combo Bulk API is running',
    timestamp: new Date().toISOString(),
    services: {
      database: !!process.env.DATABASE_URL,
      sendgrid: !!process.env.SENDGRID_API_KEY,
      smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      httpsms: !!(process.env.HTTPSMS_API_KEY && process.env.HTTPSMS_PHONE_ID)
    }
  })
}

// POST endpoint for combo bulk sending
export async function POST(request: NextRequest) {
  try {
    // Initialize services
    await initializeServices()

    // Check if database is available
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database service not available', code: 'DB_UNAVAILABLE' },
        { status: 503 }
      )
    }

    // Parse request body
    const body: ComboRequest = await request.json()
    const {
      emailSubject,
      emailContent,
      whatsappMessage,
      smsMessage,
      studentIds = [],
      guestIds = [],
      professorIds = [],
      invitationTitle,
      sendMethod = 'combo'
    } = body

    // Validate input
    if (!emailSubject && !whatsappMessage && !smsMessage) {
      return NextResponse.json(
        { error: 'At least one message content (email, WhatsApp, or SMS) is required' },
        { status: 400 }
      )
    }

    if (studentIds.length === 0 && guestIds.length === 0 && professorIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient group must be selected' },
        { status: 400 }
      )
    }

    // Fetch recipients from database
    let allRecipients: Recipient[] = []
    
    try {
      const [students, guests, professors] = await Promise.all([
        studentIds.length > 0 ? prisma.student.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, name: true, email: true, phone: true }
        }).catch(() => []) : [],
        
        guestIds.length > 0 ? prisma.guest.findMany({
          where: { id: { in: guestIds } },
          select: { id: true, name: true, email: true, phone: true }
        }).catch(() => []) : [],
        
        professorIds.length > 0 ? prisma.professor.findMany({
          where: { id: { in: professorIds } },
          select: { id: true, name: true, email: true, phone: true }
        }).catch(() => []) : []
      ])

      allRecipients = [...students, ...guests, ...professors]
    } catch (error) {
      console.error('Database fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch recipients from database' },
        { status: 500 }
      )
    }

    if (allRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found with the provided IDs' },
        { status: 404 }
      )
    }

    // Create invitation record
    let invitationId: string | null = null
    try {
      const invitation = await prisma.invitation.create({
        data: {
          title: invitationTitle || `Combo Campaign: ${emailSubject || whatsappMessage || smsMessage || 'Multi-channel'}`,
          subject: emailSubject || 'Multi-channel Campaign',
          content: emailContent || whatsappMessage || smsMessage || '',
          sentCount: allRecipients.length,
          createdAt: new Date()
        }
      })
      invitationId = invitation.id
    } catch (error) {
      console.warn('Failed to create invitation record:', error)
    }

    // Initialize counters
    let emailResults = { sent: 0, failed: 0, errors: [] as any[] }
    let whatsappResults = { sent: 0, failed: 0, links: [] as string[] }
    let smsResults = { sent: 0, failed: 0, errors: [] as any[] }

    // Send Emails
    if ((sendMethod === 'email' || sendMethod === 'combo') && emailSubject && emailContent) {
      emailResults = await sendBulkEmails(allRecipients, emailSubject, emailContent)
    }

    // Generate WhatsApp Links
    if ((sendMethod === 'whatsapp' || sendMethod === 'combo') && whatsappMessage) {
      whatsappResults = await generateWhatsAppLinks(allRecipients, whatsappMessage)
    }

    // Send SMS
    if ((sendMethod === 'sms' || sendMethod === 'combo') && smsMessage) {
      smsResults = await sendBulkSMS(allRecipients, smsMessage)
    }

    // Log activities (optional, won't fail if unsuccessful)
    try {
      if (invitationId && allRecipients.length > 0) {
        const emailLogs = allRecipients.map((recipient: Recipient) => ({
          invitationId,
          recipientType: 'student', // You can enhance this logic
          status: 'sent',
          studentId: recipient.id,
          createdAt: new Date()
        }))
        
        await prisma.emailLog.createMany({ 
          data: emailLogs,
          skipDuplicates: true 
        }).catch(() => {}) // Silent fail for logging
      }
    } catch (error) {
      console.warn('Failed to create email logs:', error)
    }

    // Return comprehensive results
    return NextResponse.json({
      success: true,
      message: 'Combo campaign completed successfully!',
      data: {
        totalRecipients: allRecipients.length,
        invitationId,
        emailResults: emailResults.sent > 0 || emailResults.failed > 0 ? emailResults : null,
        whatsappResults: whatsappResults.links.length > 0 ? whatsappResults : null,
        smsResults: smsResults.sent > 0 || smsResults.failed > 0 ? smsResults : null,
        recipients: allRecipients.map(r => ({ 
          id: r.id, 
          name: r.name, 
          email: r.email,
          hasPhone: !!r.phone 
        }))
      }
    })

  } catch (error: unknown) {
    const err = error as Error
    console.error('❌ Combo bulk send error:', err)
    return NextResponse.json(
      { 
        error: 'Failed to process combo campaign',
        message: err.message,
        code: 'COMBO_CAMPAIGN_ERROR' 
      },
      { status: 500 }
    )
  }
}

// Email sending function
async function sendBulkEmails(recipients: Recipient[], subject: string, content: string) {
  const results = { sent: 0, failed: 0, errors: [] as any[] }
  
  if (!sgMail && !nodemailer) {
    return { ...results, errors: [{ error: 'No email service available' }] }
  }

  for (const recipient of recipients) {
    try {
      const personalizedSubject = subject.replace(/\{\{name\}\}/g, recipient.name)
      const personalizedContent = content.replace(/\{\{name\}\}/g, recipient.name)

      if (sgMail) {
        // Send with SendGrid
        await sgMail.send({
          to: recipient.email,
          from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com',
          subject: personalizedSubject,
          html: personalizedContent,
          trackingSettings: {
            clickTracking: { enable: false },
            openTracking: { enable: false }
          }
        })
      } else if (nodemailer) {
        // Send with Nodemailer
        await nodemailer.sendMail({
          from: process.env.SMTP_USER || 'noreply@example.com',
          to: recipient.email,
          subject: personalizedSubject,
          html: personalizedContent
        })
      }

      results.sent++
      await new Promise(resolve => setTimeout(resolve, 100)) // Rate limiting
    } catch (error: unknown) {
      const err = error as Error
      results.failed++
      results.errors.push({
        name: recipient.name,
        email: recipient.email,
        error: err.message
      })
    }
  }

  return results
}

// WhatsApp link generation function
async function generateWhatsAppLinks(recipients: Recipient[], message: string) {
  const results = { sent: 0, failed: 0, links: [] as string[] }
  
  for (const recipient of recipients) {
    try {
      const personalizedMessage = message.replace(/\{\{name\}\}/g, recipient.name)
      const encodedMessage = encodeURIComponent(personalizedMessage)
      
      let whatsappLink = ''
      if (recipient.phone) {
        const cleanPhone = recipient.phone.replace(/\D/g, '')
        const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone
        whatsappLink = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
      } else {
        whatsappLink = `https://wa.me/?text=${encodedMessage}`
      }
      
      results.links.push({
        name: recipient.name,
        phone: recipient.phone,
        link: whatsappLink
      } as any)
      results.sent++
    } catch (error) {
      results.failed++
    }
  }
  
  return results
}

// SMS sending function
async function sendBulkSMS(recipients: Recipient[], message: string) {
  const results = { sent: 0, failed: 0, errors: [] as any[] }
  
  if (!process.env.HTTPSMS_API_KEY) {
    return { ...results, errors: [{ error: 'SMS service not configured' }] }
  }

  for (const recipient of recipients) {
    if (!recipient.phone) continue

    try {
      const personalizedMessage = message.replace(/\{\{name\}\}/g, recipient.name)
      
      const response = await fetch('https://api.httpsms.com/v1/messages/send', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.HTTPSMS_API_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: personalizedMessage,
          from: process.env.HTTPSMS_PHONE_ID,
          to: recipient.phone
        })
      })

      if (response.ok) {
        results.sent++
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Rate limiting for SMS
    } catch (error: unknown) {
      const err = error as Error
      results.failed++
      results.errors.push({
        name: recipient.name,
        phone: recipient.phone,
        error: err.message
      })
    }
  }
  
  return results
}
