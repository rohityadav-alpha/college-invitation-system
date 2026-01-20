import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

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
            student: true
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

    // Prepare retry emails
    const retryEmails = failedLogs.map(log => {
      if (!log.student) {
        throw new Error(`Student not found for email log ${log.id}`);
      }
      const personalizedContent = invitation.content.replace(/\{\{name\}\}/g, log.student.name)
      const personalizedSubject = invitation.subject.replace(/\{\{name\}\}/g, log.student.name)

      return {
        to: log.student.email,
        from: process.env.SENDGRID_FROM_EMAIL!,
        subject: `[RETRY] ${personalizedSubject}`,
        html: personalizedContent
      }
    })

    // Send retry emails
    try {
      await sgMail.send(retryEmails)

      // Update email logs status
      const updatePromises = failedLogs.map(log =>
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

      return NextResponse.json({
        success: true,
        message: `Successfully retried ${failedLogs.length} failed emails`,
        retriedCount: failedLogs.length
      })

    } catch (emailError: any) {
      console.error('Retry email error:', emailError)
      return NextResponse.json(
        { error: 'Failed to retry emails: ' + emailError.message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Retry failed emails error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
