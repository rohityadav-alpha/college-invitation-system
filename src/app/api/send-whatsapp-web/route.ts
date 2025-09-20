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
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

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

    const validStudents = students.filter(s => s.phone && s.phone.trim().length > 0)
    const validGuests = guests.filter(g => g.phone && g.phone.trim().length > 0)
    const validProfessors = professors.filter(p => p.phone && p.phone.trim().length > 0)

    const totalRecipients = validStudents.length + validGuests.length + validProfessors.length

    if (totalRecipients === 0) {
      return NextResponse.json(
        { error: 'No valid phone numbers found' },
        { status: 400 }
      )
    }

    // Create invitation record
    const invitation = await prisma.invitation.create({
      data: {
        title: invitationTitle || `WhatsApp: ${message.substring(0, 50)}...`,
        subject: 'WhatsApp Message',
        content: message,
        sentCount: totalRecipients
      }
    })

    // Prepare WhatsApp links for manual sending
    const whatsappLinks: Array<{
      name: string;
      phone: string;
      whatsappLink: string;
      message: string;
    }> = []

    // Format phone numbers and create links
    const formatPhoneNumber = (phone: string): string => {
      let cleaned = phone.replace(/\D/g, '')
      if (cleaned.length === 10) {
        cleaned = '91' + cleaned // Add India country code
      }
      return cleaned
    }

    // Generate WhatsApp Web links
    [...validStudents, ...validGuests, ...validProfessors].forEach(recipient => {
      const personalizedMessage = message.replace(/\{\{name\}\}/g, recipient.name)
      const formattedPhone = formatPhoneNumber(recipient.phone!)
      const encodedMessage = encodeURIComponent(personalizedMessage)
      
      whatsappLinks.push({
        name: recipient.name,
        phone: recipient.phone!,
        whatsappLink: `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`,
        message: personalizedMessage
      })
    })

    // Log the messages
    const emailLogs = [...validStudents, ...validGuests, ...validProfessors].map(recipient => {
      const logData: any = {
        invitationId: invitation.id,
        recipientType: validStudents.find(s => s.id === recipient.id) ? 'student' :
                      validGuests.find(g => g.id === recipient.id) ? 'guest' : 'professor',
        status: 'generated' // Changed from 'sent' to 'generated'
      }
      
      if (validStudents.find(s => s.id === recipient.id)) {
        logData.studentId = recipient.id
      } else if (validGuests.find(g => g.id === recipient.id)) {
        logData.guestId = recipient.id
      } else {
        logData.professorId = recipient.id
      }
      
      return logData
    })

    await prisma.emailLog.createMany({ data: emailLogs })

    return NextResponse.json({
      success: true,
      message: `Generated WhatsApp links for ${totalRecipients} recipients`,
      invitationId: invitation.id,
      totalRecipients,
      whatsappLinks, // Return links for frontend to open
      instructions: "Click on each WhatsApp link to send messages individually"
    })

  } catch (error: any) {
    console.error('WhatsApp Web generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate WhatsApp links: ' + error.message },
      { status: 500 }
    )
  }
}
