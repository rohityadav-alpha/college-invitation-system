import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      studentIds = [],
      guestIds = [],
      professorIds = [],
      invitationTitle
    } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'SMS message content is required' },
        { status: 400 }
      )
    }

    // Check httpSMS credentials
    if (!process.env.HTTPSMS_API_KEY || !process.env.HTTPSMS_PHONE_ID) {
      return NextResponse.json(
        { error: 'httpSMS not configured. Please setup your Android phone first.' },
        { status: 500 }
      )
    }
console.log('🔑 Environment Check:')
console.log('HTTPSMS_API_KEY exists:', !!process.env.HTTPSMS_API_KEY)
console.log('HTTPSMS_API_KEY value:', process.env.HTTPSMS_API_KEY?.substring(0, 20) + '...')
console.log('HTTPSMS_PHONE_ID:', process.env.HTTPSMS_PHONE_ID)
    // Fetch recipients with phone numbers
    const [students, guests, professors] = await Promise.all([
      studentIds.length > 0 ? prisma.student.findMany({
        where: { 
          id: { in: studentIds },
          phone: { not: null }
        },
        select: { id: true, name: true, phone: true }
      }) : [],
      guestIds.length > 0 ? prisma.guest.findMany({
        where: { 
          id: { in: guestIds },
          phone: { not: null }
        },
        select: { id: true, name: true, phone: true }
      }) : [],
      professorIds.length > 0 ? prisma.professor.findMany({
        where: { 
          id: { in: professorIds },
          phone: { not: null }
        },
        select: { id: true, name: true, phone: true }
      }) : []
    ])

    const validStudents = students.filter(s => s.phone && s.phone.trim().length >= 10)
    const validGuests = guests.filter(g => g.phone && g.phone.trim().length >= 10)
    const validProfessors = professors.filter(p => p.phone && p.phone.trim().length >= 10)

    const totalRecipients = validStudents.length + validGuests.length + validProfessors.length

    if (totalRecipients === 0) {
      return NextResponse.json(
        { error: 'No valid phone numbers found' },
        { status: 400 }
      )
    }

    // Daily limit check (your data plan limit)
    if (totalRecipients > 100) {
      return NextResponse.json(
        { error: `Cannot send to ${totalRecipients} recipients. Consider your daily SMS limit (usually 100/day).` },
        { status: 400 }
      )
    }

    // Create invitation record
    const invitation = await prisma.invitation.create({
      data: {
        title: invitationTitle || `Phone SMS: ${message.substring(0, 50)}...`,
        subject: 'SMS Invitation via Your Phone',
        content: message,
        sentCount: totalRecipients
      }
    })

    const formatPhoneNumber = (phone: string): string => {
      let cleaned = phone.replace(/\D/g, '')
      if (cleaned.length === 11 && cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1)
      }
      if (cleaned.length === 10) {
        cleaned = '+91' + cleaned
      }
      return cleaned
    }

    const results = []
    
    // Process all recipients
    const allRecipients = [
      ...validStudents.map(s => ({ ...s, type: 'student' })),
      ...validGuests.map(g => ({ ...g, type: 'guest' })),
      ...validProfessors.map(p => ({ ...p, type: 'professor' }))
    ]

    // Send SMS via your Android phone using httpSMS
    for (const recipient of allRecipients) {
      try {
        const personalizedMessage = message.replace(/\{\{name\}\}/g, recipient.name)
        const formattedPhone = formatPhoneNumber(recipient.phone!)

        console.log(`📱 Sending SMS via your phone to ${recipient.name} (${formattedPhone}): ${personalizedMessage.substring(0, 50)}...`)

        // httpSMS API call
        const response = await fetch('https://api.httpsms.com/v1/messages/send', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.HTTPSMS_API_KEY!,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: personalizedMessage,
            from: process.env.HTTPSMS_PHONE_ID!,
            to: formattedPhone
          })
        })

        const result = await response.json()
        console.log(`httpSMS response for ${recipient.name}:`, result)

        if (response.ok && result.id) {
          results.push({
            name: recipient.name,
            phone: recipient.phone,
            status: 'sent',
            messageId: result.id,
            sentVia: 'Your Android Phone'
          })
        } else {
          results.push({
            name: recipient.name,
            phone: recipient.phone,
            status: 'failed',
            error: result.message || 'Phone SMS failed'
          })
        }

        // Rate limiting - 3 seconds delay (respect your carrier limits)
        await new Promise(resolve => setTimeout(resolve, 3000))

      } catch (error: any) {
        console.error(`❌ Failed SMS to ${recipient.name}:`, error.message)
        results.push({
          name: recipient.name,
          phone: recipient.phone,
          status: 'failed',
          error: error.message
        })
      }
    }

    // Log successful messages in database
    const successfulResults = results.filter(r => r.status === 'sent')
    
    if (successfulResults.length > 0) {
      const smsLogs = successfulResults.map(result => {
        const recipient = allRecipients.find(r => r.phone === result.phone)
        const logData: any = {
          invitationId: invitation.id,
          recipientType: recipient?.type || 'unknown',
          status: 'sent'
        }
        
        if (recipient?.type === 'student') {
          logData.studentId = recipient.id
        } else if (recipient?.type === 'guest') {
          logData.guestId = recipient.id
        } else if (recipient?.type === 'professor') {
          logData.professorId = recipient.id
        }
        
        return logData
      })

      await prisma.emailLog.createMany({ data: smsLogs })
    }

    const successCount = results.filter(r => r.status === 'sent').length
    const failedCount = results.filter(r => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      message: `Phone SMS completed: ${successCount} sent, ${failedCount} failed`,
      invitationId: invitation.id,
      totalProcessed: totalRecipients,
      successCount,
      failedCount,
      results: results.slice(0, 10),
      provider: 'Your Android Phone (httpSMS)',
      costAnalysis: {
        httpSMSFree: Math.min(successCount, 200),
        fromDataPlan: Math.max(0, successCount - 200),
        totalCost: '₹0 (using your phone\'s data plan)',
        note: 'First 200 SMS/month free via httpSMS, rest from your data plan'
      }
    })

  } catch (error: any) {
    console.error('❌ Phone SMS bulk send error:', error)
    return NextResponse.json(
      { error: 'Failed to send phone SMS: ' + error.message },
      { status: 500 }
    )
  }
}
