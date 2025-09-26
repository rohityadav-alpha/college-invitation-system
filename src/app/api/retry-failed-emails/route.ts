// src/app/api/retry-failed-emails/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBulkEmails } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { invitationId } = await request.json()

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    // Get invitation and failed email logs
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        emailLogs: {
          where: { status: 'failed' },
          include: {
            student: true,
            guest: true,
            professor: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    const failedLogs = invitation.emailLogs
    if (failedLogs.length === 0) {
      return NextResponse.json(
        { message: 'No failed emails to retry' },
        { status: 200 }
      )
    }

    // Prepare retry emails with proper recipient data
    const retryEmails = failedLogs.map(log => {
      let recipient: any = null
      let recipientType = ''

      if (log.student) {
        recipient = log.student
        recipientType = 'student'
      } else if (log.guest) {
        recipient = log.guest
        recipientType = 'guest'
      } else if (log.professor) {
        recipient = log.professor
        recipientType = 'professor'
      }

      if (!recipient) {
        throw new Error(`Recipient not found for email log ${log.id}`)
      }

      return {
        to: recipient.email,
        name: recipient.name,
        recipientId: recipient.id,
        recipientType: recipientType
      }
    })

    // Send retry emails using MailerSend
    try {
      const personalizedSubject = `[RETRY] ${invitation.subject}`
      const result = await sendBulkEmails(retryEmails, personalizedSubject, invitation.content)

      if (result.success) {
        // Update email logs status for successful retries
        const successfulRetries = result.data.filter((r: any) => r.success)
        
        if (successfulRetries.length > 0) {
          const updatePromises = failedLogs.slice(0, successfulRetries.length).map(log =>
            prisma.emailLog.update({
              where: { id: log.id },
              data: {
                status: 'sent',
                sentAt: new Date(),
                errorMessage: null
              }
            })
          )
          
          await Promise.all(updatePromises)
        }

        return NextResponse.json({
          success: true,
          message: `Successfully retried ${successfulRetries.length} out of ${failedLogs.length} failed emails`,
          retriedCount: successfulRetries.length,
          totalFailed: failedLogs.length,
          provider: 'MailerSend'
        })
      } else {
        throw new Error(result.error || 'Unknown MailerSend error')
      }

    } catch (emailError: any) {
      console.error('Retry email error:', emailError)
      return NextResponse.json(
        { error: 'Failed to retry emails with MailerSend: ' + emailError.message },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('Retry failed emails error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}
