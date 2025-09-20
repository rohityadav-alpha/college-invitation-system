import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import sgMail from '@sendgrid/mail'
import twilio from 'twilio'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function POST(request: NextRequest) {
  try {
    const {
      emailSubject,
      emailContent,
      whatsappMessage,
      studentIds = [],
      guestIds = [],
      professorIds = [],
      invitationTitle,
      sendMethod = 'both' // 'email', 'whatsapp', 'both'
    } = await request.json()

    if (!emailSubject && !whatsappMessage) {
      return NextResponse.json(
        { error: 'At least email or WhatsApp content is required' },
        { status: 400 }
      )
    }

    // Fetch recipients with both email and phone
    const [students, guests, professors] = await Promise.all([
      studentIds.length > 0 ? prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, name: true, email: true, phone: true }
      }) : [],
      guestIds.length > 0 ? prisma.guest.findMany({
        where: { id: { in: guestIds } },
        select: { id: true, name: true, email: true, phone: true }
      }) : [],
      professorIds.length > 0 ? prisma.professor.findMany({
        where: { id: { in: professorIds } },
        select: { id: true, name: true, email: true, phone: true }
      }) : []
    ])

    const allRecipients = [...students, ...guests, ...professors]
    
    if (allRecipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients found' },
        { status: 400 }
      )
    }

    // Create invitation record
    const invitation = await prisma.invitation.create({
      data: {
        title: invitationTitle || `Combo: ${emailSubject || whatsappMessage?.substring(0, 50)}`,
        subject: emailSubject || 'WhatsApp + Email Campaign',
        content: emailContent || whatsappMessage || '',
        sentCount: allRecipients.length
      }
    })

    let emailSuccessCount = 0
    let whatsappSuccessCount = 0
    let failedEmails = []
    let failedWhatsApp = []

    // Send emails if requested
    if ((sendMethod === 'email' || sendMethod === 'both') && emailSubject && emailContent) {
      for (const recipient of allRecipients) {
        try {
          const personalizedSubject = emailSubject.replace(/\{\{name\}\}/g, recipient.name)
          const personalizedContent = emailContent.replace(/\{\{name\}\}/g, recipient.name)

          await sgMail.send({
            to: recipient.email,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: personalizedSubject,
            html: personalizedContent,
            trackingSettings: {
              clickTracking: { enable: false },
              openTracking: { enable: false }
            }
          })

          emailSuccessCount++
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error: any) {
          failedEmails.push({
            name: recipient.name,
            email: recipient.email,
            error: error.message
          })
        }
      }
    }

    // Send WhatsApp messages if requested
    if ((sendMethod === 'whatsapp' || sendMethod === 'both') && whatsappMessage) {
      const formatPhoneNumber = (phone: string): string => {
        let cleaned = phone.replace(/\D/g, '')
        if (cleaned.length === 10) {
          cleaned = '91' + cleaned
        }
        return `whatsapp:+${cleaned}`
      }

      for (const recipient of allRecipients) {
        if (recipient.phone && recipient.phone.trim().length > 0) {
          try {
            const personalizedMessage = whatsappMessage.replace(/\{\{name\}\}/g, recipient.name)

            await twilioClient.messages.create({
              to: formatPhoneNumber(recipient.phone),
              from: process.env.TWILIO_WHATSAPP_FROM!,
              body: personalizedMessage
            })

            whatsappSuccessCount++
            await new Promise(resolve => setTimeout(resolve, 500))

          } catch (error: any) {
            failedWhatsApp.push({
              name: recipient.name,
              phone: recipient.phone,
              error: error.message
            })
          }
        }
      }
    }

    // Log activities
    const emailLogs = allRecipients.map((recipient, index) => {
      const logData: any = {
        invitationId: invitation.id,
        recipientType: students.find(s => s.id === recipient.id) ? 'student' :
                      guests.find(g => g.id === recipient.id) ? 'guest' : 'professor',
        status: 'sent'
      }
      
      if (students.find(s => s.id === recipient.id)) {
        logData.studentId = recipient.id
      } else if (guests.find(g => g.id === recipient.id)) {
        logData.guestId = recipient.id
      } else {
        logData.professorId = recipient.id
      }
      
      return logData
    })

    await prisma.emailLog.createMany({ data: emailLogs })

    return NextResponse.json({
      success: true,
      message: `Combo campaign completed!`,
      emailResults: {
        sent: emailSuccessCount,
        failed: failedEmails.length
      },
      whatsappResults: {
        sent: whatsappSuccessCount,
        failed: failedWhatsApp.length
      },
      totalRecipients: allRecipients.length,
      invitationId: invitation.id,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
      failedWhatsApp: failedWhatsApp.length > 0 ? failedWhatsApp : undefined
    })

  } catch (error: any) {
    console.error('❌ Combo bulk send error:', error)
    return NextResponse.json(
      { error: 'Failed to send combo messages: ' + error.message },
      { status: 500 }
    )
  }
}
