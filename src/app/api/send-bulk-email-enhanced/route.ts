// Enhanced Anti-Spam Bulk Email API with Error Handling
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

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

    // Check SendGrid config
    if (!process.env.SENDGRID_API_KEY) {
      return NextResponse.json(
        { error: 'SendGrid API key not configured' },
        { status: 500 }
      )
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      return NextResponse.json(
        { error: 'SendGrid FROM email not configured' },
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

    // Simple email structure (avoid complex features)
    const allEmails = []

    // Students emails
    for (const student of students) {
      const personalizedSubject = subject.replace(/\{\{name\}\}/g, student.name)
      const personalizedContent = content.replace(/\{\{name\}\}/g, student.name)
      
      allEmails.push({
        to: student.email,
        from: process.env.SENDGRID_FROM_EMAIL!, // Simple string format
        subject: personalizedSubject,
        html: personalizedContent,
        recipientData: { id: student.id, type: 'student' }
      })
    }

    // Guests emails  
    for (const guest of guests) {
      const personalizedSubject = subject.replace(/\{\{name\}\}/g, guest.name)
      const personalizedContent = content.replace(/\{\{name\}\}/g, guest.name)
      
      allEmails.push({
        to: guest.email,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: personalizedSubject,
        html: personalizedContent,
        recipientData: { id: guest.id, type: 'guest' }
      })
    }

    // Professors emails
    for (const professor of professors) {
      const personalizedSubject = subject.replace(/\{\{name\}\}/g, professor.name)
      const personalizedContent = content.replace(/\{\{name\}\}/g, professor.name)
      
      allEmails.push({
        to: professor.email,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: personalizedSubject,
        html: personalizedContent,
        recipientData: { id: professor.id, type: 'professor' }
      })
    }

    console.log('📧 Attempting to send emails:', {
      totalEmails: allEmails.length,
      fromEmail: process.env.SENDGRID_FROM_EMAIL,
      sampleEmail: allEmails[0] ? {
        to: allEmails[0].to,
        subject: allEmails[0].subject.substring(0, 50),
        hasContent: !!allEmails[0].html
      } : 'None'
    })

    // Remove recipient data for sending
    const emailsToSend = allEmails.map(({ recipientData, ...email }) => email)

    // Send emails with detailed error handling
    try {
      // Send one by one for better error tracking
      let successCount = 0
      let failedEmails = []

      for (let i = 0; i < emailsToSend.length; i++) {
        try {
          await sgMail.send(emailsToSend[i])
          successCount++
          
          // Small delay between emails
          if (i < emailsToSend.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        } catch (emailError: any) {
          console.error(`❌ Failed to send email to ${emailsToSend[i].to}:`, {
            code: emailError.code,
            message: emailError.message,
            response: emailError.response?.body || 'No response body'
          })
          
          failedEmails.push({
            email: emailsToSend[i].to,
            error: emailError.message,
            code: emailError.code
          })
        }
      }

      // Log successful emails only
      if (successCount > 0) {
        const successfulLogs = allEmails.slice(0, successCount).map(email => {
          const logData: any = {
            invitationId: invitation.id,
            recipientType: email.recipientData.type,
            status: 'sent'
          }
          
          if (email.recipientData.type === 'student') {
            logData.studentId = email.recipientData.id
          } else if (email.recipientData.type === 'guest') {
            logData.guestId = email.recipientData.id
          } else if (email.recipientData.type === 'professor') {
            logData.professorId = email.recipientData.id
          }
          
          return logData
        })

        await prisma.emailLog.createMany({ data: successfulLogs })
      }

      return NextResponse.json({
        success: true,
        message: `Successfully sent ${successCount} emails out of ${totalRecipients} (Students: ${students.length}, Guests: ${guests.length}, Professors: ${professors.length})`,
        invitationId: invitation.id,
        sentCount: successCount,
        failedCount: failedEmails.length,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined
      })

    } catch (sendError: any) {
      console.error('❌ SendGrid send error details:', {
        code: sendError.code,
        message: sendError.message,
        response: sendError.response?.body,
        stack: sendError.stack
      })

      // Try to extract specific error details
      let errorDetails = 'Unknown SendGrid error'
      if (sendError.response?.body?.errors) {
        errorDetails = sendError.response.body.errors.map((e: any) => 
          `${e.field || 'field'}: ${e.message || 'error'}`
        ).join(', ')
      } else if (sendError.message) {
        errorDetails = sendError.message
      }

      return NextResponse.json(
        { 
          error: `SendGrid API Error: ${errorDetails}`,
          code: sendError.code,
          details: sendError.response?.body || null
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ General error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}
