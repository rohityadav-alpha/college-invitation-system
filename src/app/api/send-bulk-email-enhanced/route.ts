// src/app/api/send-bulk-email-enhanced/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBulkEmails } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const {
      subject,
      content,
      studentIds = [],
      guestIds = [],
      professorIds = [],
      invitationTitle
    } = await request.json()

    // Validation
    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    // Check MailerSend config
    if (!process.env.MAILERSEND_API_KEY) {
      return NextResponse.json(
        { error: 'MailerSend API key not configured' },
        { status: 500 }
      )
    }

    if (!process.env.MAILERSEND_FROM_EMAIL) {
      return NextResponse.json(
        { error: 'MailerSend FROM email not configured' },
        { status: 500 }
      )
    }

    // Fetch recipients
    const [students, guests, professors] = await Promise.all([
      studentIds.length > 0 ? prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, name: true, email: true }
      }) : [],
      guestIds.length > 0 ? prisma.guest.findMany({
        where: { id: { in: guestIds } },
        select: { id: true, name: true, email: true }
      }) : [],
      professorIds.length > 0 ? prisma.professor.findMany({
        where: { id: { in: professorIds } },
        select: { id: true, name: true, email: true }
      }) : []
    ])

    const totalRecipients = students.length + guests.length + professors.length

    if (totalRecipients === 0) {
      return NextResponse.json(
        { error: 'No valid recipients found' },
        { status: 400 }
      )
    }

    // Create invitation record
    const invitation = await prisma.invitation.create({
      data: {
        title: invitationTitle || subject,
        subject,
        content,
        sentCount: totalRecipients
      }
    })

    // Prepare all recipients for MailerSend with proper recipient data
    const allRecipients = [
      ...students.map(s => ({ id: s.id, name: s.name, email: s.email, type: 'student' })),
      ...guests.map(g => ({ id: g.id, name: g.name, email: g.email, type: 'guest' })),
      ...professors.map(p => ({ id: p.id, name: p.name, email: p.email, type: 'professor' }))
    ]

    console.log('Attempting to send emails with MailerSend:', {
      totalEmails: allRecipients.length,
      fromEmail: process.env.MAILERSEND_FROM_EMAIL,
      sampleEmail: allRecipients[0] ? {
        to: allRecipients[0].email,
        subject: subject.substring(0, 50),
        hasContent: !!content
      } : 'None'
    })

    // Prepare email list for MailerSend with recipient details
    const emailList = allRecipients.map(recipient => ({
      to: recipient.email,
      name: recipient.name,
      recipientId: recipient.id,
      recipientType: recipient.type
    }))

    // Send emails using MailerSend
    try {
      const result = await sendBulkEmails(emailList, subject, content, invitation.id)
      
      let successCount = 0
      let failedEmails: any[] = []

      if (result.success && result.data) {
        successCount = result.data.filter((r: any) => r.success).length
        failedEmails = result.data
          .filter((r: any) => !r.success)
          .map((r: any) => ({
            email: r.email,
            error: r.error,
            code: 'MAILERSEND_ERROR'
          }))
      } else {
        failedEmails = allRecipients.map(recipient => ({
          email: recipient.email,
          error: result.error || 'Unknown MailerSend error',
          code: 'MAILERSEND_ERROR'
        }))
      }

      return NextResponse.json({
        success: true,
        message: `MailerSend: Successfully sent ${successCount} emails out of ${totalRecipients} (Students: ${students.length}, Guests: ${guests.length}, Professors: ${professors.length})`,
        invitationId: invitation.id,
        sentCount: successCount,
        failedCount: failedEmails.length,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
        provider: 'MailerSend'
      })

    } catch (sendError: any) {
      console.error('MailerSend send error details:', sendError)

      return NextResponse.json({
        error: `MailerSend API Error: ${sendError.message}`,
        code: 'MAILERSEND_ERROR',
        details: sendError.response || null,
        provider: 'MailerSend'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('General error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}
