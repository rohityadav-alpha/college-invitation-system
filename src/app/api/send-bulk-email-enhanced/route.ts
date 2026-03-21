// Enhanced Anti-Spam Bulk Email API with Error Handling
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTransporter } from '@/lib/email'

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

    // Check Gmail config
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: 'Gmail credentials not configured' },
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
        from: `"College Invitation System" <${process.env.GMAIL_USER}>`,
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
        from: `"College Invitation System" <${process.env.GMAIL_USER}>`,
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
        from: `"College Invitation System" <${process.env.GMAIL_USER}>`,
        subject: personalizedSubject,
        html: personalizedContent,
        recipientData: { id: professor.id, type: 'professor' }
      })
    }

    console.log('📧 Attempting to send emails via Gmail:', {
      totalEmails: allEmails.length,
      fromEmail: process.env.GMAIL_USER,
      sampleEmail: allEmails[0] ? {
        to: allEmails[0].to,
        subject: allEmails[0].subject.substring(0, 50),
        hasContent: !!allEmails[0].html
      } : 'None'
    })

    const transporter = createTransporter()

    // Send emails with detailed error handling
    try {
      // Send one by one for better error tracking
      let successCount = 0
      let failedEmails = []

      for (let i = 0; i < allEmails.length; i++) {
        const emailOptions = allEmails[i]
        try {
          await transporter.sendMail({
            from: emailOptions.from,
            to: emailOptions.to,
            subject: emailOptions.subject,
            html: emailOptions.html
          })
          successCount++
          
          // Small delay between emails
          if (i < allEmails.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        } catch (emailError: any) {
          console.error(`❌ Failed to send email to ${emailOptions.to}:`, emailError.message)
          
          failedEmails.push({
            email: emailOptions.to,
            error: emailError.message,
            code: emailError.code || 500
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
      console.error('❌ Gmail send error details:', sendError)
      return NextResponse.json(
        { 
          error: `Gmail API Error: ${sendError.message}`,
          code: sendError.code
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
