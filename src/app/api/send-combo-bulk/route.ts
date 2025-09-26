// src/app/api/send-combo-bulk/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { sendBulkEmails } from '@/lib/email'

// Build-safe configuration
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Dynamic service initialization
let servicesInitialized = false
let prisma: any = null

const initializeServices = async () => {
  if (servicesInitialized) return
  
  try {
    // Import Prisma dynamically
    if (!prisma) {
      const { prisma: p } = await import('@/lib/prisma')
      prisma = p
    }
    
    servicesInitialized = true
  } catch (error) {
    console.error('Service initialization error:', error)
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Send Combo Bulk API is running',
    services: {
      database: !!process.env.DATABASE_URL,
      mailersend: !!process.env.MAILERSEND_API_KEY,
      httpsms: !!(process.env.HTTPSMS_API_KEY && process.env.HTTPSMS_PHONE_ID)
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    await initializeServices()
    
    if (!prisma) {
      return NextResponse.json(
        { error: 'Database service not available' },
        { status: 503 }
      )
    }

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
    } = await request.json()

    // Validate input
    if (!emailSubject && !whatsappMessage && !smsMessage) {
      return NextResponse.json(
        { error: 'At least one message type is required' },
        { status: 400 }
      )
    }

    // Fetch recipients
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

    const allRecipients = [...students, ...guests, ...professors]

    if (allRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found' },
        { status: 404 }
      )
    }

    // Create invitation record
    let invitationId: string | null = null
    try {
      const invitation = await prisma.invitation.create({
        data: {
          title: invitationTitle || 'Combo Campaign',
          subject: emailSubject || 'Multi-channel Campaign',
          content: emailContent || whatsappMessage || smsMessage || '',
          sentCount: allRecipients.length
        }
      })
      invitationId = invitation.id
    } catch (error) {
      console.warn('Failed to create invitation record:', error)
    }

    // Send emails with MailerSend
    let emailResults = { sent: 0, failed: 0, errors: [] as any[] }
    if ((sendMethod === 'email' || sendMethod === 'combo') && emailSubject && emailContent) {
      try {
        const emailList = allRecipients.map((recipient, index) => {
          const recipientType = 
            students.some(s => s.id === recipient.id) ? 'student' :
            guests.some(g => g.id === recipient.id) ? 'guest' : 'professor'
          
          return {
            to: recipient.email,
            name: recipient.name,
            recipientId: recipient.id,
            recipientType
          }
        })

        const result = await sendBulkEmails(
          emailList,
          emailSubject,
          emailContent,
          invitationId
        )

        if (result.success) {
          emailResults.sent = result.data.filter((r: any) => r.success).length
          emailResults.failed = result.data.filter((r: any) => !r.success).length
          emailResults.errors = result.data.filter((r: any) => !r.success).map((r: any) => ({
            email: r.email,
            error: r.error
          }))
        } else {
          emailResults.failed = allRecipients.length
          emailResults.errors = [{ general: result.error }]
        }
      } catch (error: any) {
        emailResults.failed = allRecipients.length
        emailResults.errors = [{ general: error.message }]
      }
    }

    // Generate WhatsApp links
    let whatsappResults = { sent: 0, links: [] as any[] }
    if ((sendMethod === 'whatsapp' || sendMethod === 'combo') && whatsappMessage) {
      for (const recipient of allRecipients) {
        try {
          const personalizedMessage = whatsappMessage.replace(/\{\{name\}\}/g, recipient.name)
          const encodedMessage = encodeURIComponent(personalizedMessage)
          let whatsappLink = ''
          
          if (recipient.phone) {
            const cleanPhone = recipient.phone.replace(/\D/g, '')
            const formattedPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone
            whatsappLink = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
          } else {
            whatsappLink = `https://wa.me/?text=${encodedMessage}`
          }

          whatsappResults.links.push({
            name: recipient.name,
            phone: recipient.phone,
            link: whatsappLink
          })
          whatsappResults.sent++
        } catch (error) {
          // Silent fail for WhatsApp links
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Combo campaign completed with MailerSend!',
      data: {
        totalRecipients: allRecipients.length,
        invitationId,
        emailResults: emailResults.sent > 0 || emailResults.failed > 0 ? emailResults : null,
        whatsappResults: whatsappResults.links.length > 0 ? whatsappResults : null
      }
    })

  } catch (error: unknown) {
    const err = error as Error
    console.error('Combo bulk send error:', err)
    return NextResponse.json(
      { error: 'Failed to process combo campaign', message: err.message },
      { status: 500 }
    )
  }
}
