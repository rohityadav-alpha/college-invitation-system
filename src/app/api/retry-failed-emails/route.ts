import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTransporter } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { invitationId } = await request.json()

    if (!invitationId) {
      return NextResponse.json(
        { error: 'Invitation ID is required' },
        { status: 400 }
      )
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: 'Gmail credentials not configured' },
        { status: 500 }
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

    const transporter = createTransporter()

    // Send retry emails individually
    try {
      for (const log of failedLogs) {
        if (!log.student) continue;

        const personalizedContent = invitation.content.replace(/\{\{name\}\}/g, log.student.name)
        const personalizedSubject = invitation.subject.replace(/\{\{name\}\}/g, log.student.name)

        await transporter.sendMail({
          to: log.student.email,
          from: `"College Invitation System" <${process.env.GMAIL_USER}>`,
          subject: `[RETRY] ${personalizedSubject}`,
          html: personalizedContent
        })
      }

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
