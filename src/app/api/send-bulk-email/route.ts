// Original API with Anti-Spam Enhancements
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTransporter } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { subject, content, studentIds, invitationTitle } = await request.json()

    if (!subject || !content || !studentIds || studentIds.length === 0) {
      return NextResponse.json(
        { error: 'Subject, content, and students are required' },
        { status: 400 }
      )
    }

    // Get selected students with their names
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        name: true,
        email: true
      }
    })

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'No valid students found' },
        { status: 400 }
      )
    }

    // Create invitation record
    const invitation = await prisma.invitation.create({
      data: {
        title: invitationTitle || subject,
        subject,
        content,
        sentCount: students.length
      }
    })

    // Clean subject and content (anti-spam)
    const cleanSubject = (originalSubject: string, recipientName: string) => {
      return originalSubject
        .replace(/\{\{name\}\}/g, recipientName)
        .replace(/!!+/g, '')
        .replace(/FREE|URGENT|WINNER/gi, '')
        .trim()
    }

    const cleanContent = (originalContent: string, recipientName: string) => {
      return originalContent
        .replace(/\{\{name\}\}/g, recipientName)
        .replace(/🎉|🚀|✨/g, '') // Remove excessive emojis
    }

    const transporter = createTransporter()

    // Send individually since Nodemailer doesn't support array payloads like SendGrid
    for (const student of students) {
      const personalizedSubject = cleanSubject(subject, student.name)
      const personalizedContent = cleanContent(content, student.name)

      await transporter.sendMail({
        from: `"College Committee" <${process.env.GMAIL_USER}>`,
        to: student.email,
        subject: personalizedSubject,
        html: personalizedContent,
        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@college.edu>',
          'List-Id': 'College Events <events.college.edu>'
        }
      })
      
      // Small delay between emails
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Log successful emails
    const emailLogs = students.map((student: { id: string; name: string; email: string }) => ({
      studentId: student.id,
      invitationId: invitation.id,
      recipientType: 'student',
      status: 'sent'
    }))

    await prisma.emailLog.createMany({
      data: emailLogs
    })

    return NextResponse.json({
      success: true,
      message: `Successfully sent ${students.length} anti-spam optimized emails`,
      invitationId: invitation.id,
      sentCount: students.length
    })

  } catch (error: any) {
    console.error('Bulk email error:', error)
    return NextResponse.json(
      { error: 'Failed to send emails: ' + error.message },
      { status: 500 }
    )
  }
}
