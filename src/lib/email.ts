// src\lib\email.ts
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'
import { prisma } from '@/lib/prisma'

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
})

export async function sendBulkEmails(
  emails: { to: string; name: string; recipientId?: string; recipientType?: string }[],
  subject: string,
  content: string,
  invitationId?: string
) {
  try {
    const sentFrom = new Sender(
      process.env.MAILERSEND_FROM_EMAIL!,
      process.env.MAILERSEND_FROM_NAME || "College Invitation System"
    )

    const results = []
    
    for (const { to, name, recipientId, recipientType } of emails) {
      try {
        const recipients = [new Recipient(to, name)]
        
        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject(subject.replace(/\{name\}/g, name))
          .setHtml(content.replace(/\{name\}/g, name))

        const response = await mailerSend.email.send(emailParams)
        
        // Store in your existing EmailLog schema
        if (response && response.body && invitationId) {
          const logData: any = {
            invitationId,
            messageId: response.body.message_id || null,
            recipientType: recipientType || 'unknown',
            status: 'sent'
          }
          
          // Set the appropriate foreign key based on recipient type
          if (recipientType === 'student' && recipientId) {
            logData.studentId = recipientId
          } else if (recipientType === 'guest' && recipientId) {
            logData.guestId = recipientId
          } else if (recipientType === 'professor' && recipientId) {
            logData.professorId = recipientId
          }
          
          await prisma.emailLog.create({ data: logData })
        }
        
        results.push({ 
          email: to, 
          success: true, 
          messageId: response.body?.message_id 
        })
        
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error: any) {
        console.error(`MailerSend Error for ${to}:`, error)
        results.push({ email: to, success: false, error: error.message })
      }
    }

    const successCount = results.filter(r => r.success).length
    return {
      success: true,
      message: `${successCount} emails sent successfully`,
      data: results,
    }
  } catch (error: any) {
    console.error('MailerSend Bulk Error:', error)
    return {
      success: false,
      message: 'Failed to send emails',
      error: error.message,
    }
  }
}

export async function sendTestEmail(to: string) {
  try {
    const sentFrom = new Sender(
      process.env.MAILERSEND_FROM_EMAIL!,
      process.env.MAILERSEND_FROM_NAME || "College System"
    )

    const recipients = [new Recipient(to, "Test Recipient")]

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject("Test Email - College Invitation System")
      .setHtml(`
        <h1>✅ Test Email Success!</h1>
        <p>Your MailerSend integration is working perfectly!</p>
        <p>🔄 System switched from SendGrid to MailerSend successfully.</p>
        <p>🎯 Ready to send bulk invitations with analytics!</p>
      `)

    const response = await mailerSend.email.send(emailParams)
    
    return {
      success: true,
      message: 'Test email sent successfully',
      data: response
    }
  } catch (error: any) {
    console.error('MailerSend Test Error:', error)
    return {
      success: false,
      message: 'Test email failed',
      error: error.message,
    }
  }
}
