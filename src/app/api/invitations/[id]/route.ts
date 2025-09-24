// src/app/api/invitations/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 30
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch single invitation with all channel logs
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('=== INVITATION DETAIL API START ===')
  
  try {
    const { id } = await context.params
    console.log('Fetching invitation with ID:', id)

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    }

    // Test connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected')

    // Fetch invitation with ALL channel logs
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        // Email Logs with recipient details
        emailLogs: {
          include: {
            student: {
              select: { 
                id: true, name: true, email: true, course: true, year: true 
              }
            },
            guest: {
              select: { 
                id: true, name: true, email: true, organization: true, designation: true 
              }
            },
            professor: {
              select: { 
                id: true, name: true, email: true, college: true, department: true 
              }
            }
          },
          orderBy: { sentAt: 'desc' }
        },
        
        // SMS Logs with recipient details  
        smsLogs: {
          include: {
            student: {
              select: { 
                id: true, name: true, phone: true, course: true, year: true 
              }
            },
            guest: {
              select: { 
                id: true, name: true, phone: true, organization: true, designation: true 
              }
            },
            professor: {
              select: { 
                id: true, name: true, phone: true, college: true, department: true 
              }
            }
          },
          orderBy: { sentAt: 'desc' }
        },
        
        // WhatsApp Logs with recipient details
        whatsappLogs: {
          include: {
            student: {
              select: { 
                id: true, name: true, phone: true, course: true, year: true 
              }
            },
            guest: {
              select: { 
                id: true, name: true, phone: true, organization: true, designation: true 
              }
            },
            professor: {
              select: { 
                id: true, name: true, phone: true, college: true, department: true 
              }
            }
          },
          orderBy: { sentAt: 'desc' }
        }
      }
    })

    if (!invitation) {
      console.log('❌ Invitation not found')
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Log channel statistics
    console.log(`✅ Successfully fetched invitation: ${invitation.title}`)
    console.log(`📧 Email logs: ${invitation.emailLogs?.length || 0}`)
    console.log(`📱 SMS logs: ${invitation.smsLogs?.length || 0}`)
    console.log(`💬 WhatsApp logs: ${invitation.whatsappLogs?.length || 0}`)

    // Calculate detailed analytics
    const emailLogs = invitation.emailLogs || []
    const smsLogs = invitation.smsLogs || []
    const whatsappLogs = invitation.whatsappLogs || []
    const allLogs = [...emailLogs, ...smsLogs, ...whatsappLogs]

    const detailedAnalytics = {
      summary: {
        totalMessages: allLogs.length,
        totalDelivered: allLogs.filter(log => log.status === 'delivered').length,
        totalFailed: allLogs.filter(log => log.status === 'failed').length,
        totalPending: allLogs.filter(log => log.status === 'sent').length
      },
      byChannel: {
        email: {
          total: emailLogs.length,
          delivered: emailLogs.filter(log => log.status === 'delivered').length,
          opened: emailLogs.filter(log => log.status === 'opened').length,
          clicked: emailLogs.filter(log => log.status === 'clicked').length,
          failed: emailLogs.filter(log => log.status === 'failed').length
        },
        sms: {
          total: smsLogs.length,
          delivered: smsLogs.filter(log => log.status === 'delivered').length,
          failed: smsLogs.filter(log => log.status === 'failed').length
        },
        whatsapp: {
          total: whatsappLogs.length,
          delivered: whatsappLogs.filter(log => log.status === 'delivered').length,
          read: whatsappLogs.filter(log => log.status === 'read').length,
          failed: whatsappLogs.filter(log => log.status === 'failed').length
        }
      }
    }

    const responseData = {
      ...invitation,
      analytics: detailedAnalytics,
      debug: {
        timestamp: new Date().toISOString(),
        channels: {
          email: invitation.emailLogs?.length || 0,
          sms: invitation.smsLogs?.length || 0,
          whatsapp: invitation.whatsappLogs?.length || 0
        }
      }
    }

    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'no-cache' }
    })

  } catch (error) {
    console.error('❌ Invitation Detail API Error:', {
      name: error?.name,
      message: error?.message,
      code: error?.code
    })

    return NextResponse.json({
      error: 'Failed to fetch invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    console.log('=== INVITATION DETAIL API END ===')
  }
}

// PUT - Update invitation
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { title, subject, content } = body

    if (!title?.trim() || !subject?.trim() || !content?.trim()) {
      return NextResponse.json({
        error: 'All fields are required'
      }, { status: 400 })
    }

    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: {
        title: title.trim(),
        subject: subject.trim(), 
        content: content.trim()
      }
    })

    return NextResponse.json(updatedInvitation)

  } catch (error) {
    console.error('❌ Update Invitation Error:', error)
    
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
  }
}

// DELETE - Delete invitation and all related logs
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Delete invitation (cascades to all logs automatically)
    await prisma.invitation.delete({
      where: { id }
    })

    console.log('✅ Invitation and all related logs deleted successfully')

    return NextResponse.json({
      message: 'Invitation deleted successfully',
      deletedId: id
    })

  } catch (error) {
    console.error('❌ Delete Invitation Error:', error)
    
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 })
  }
}
