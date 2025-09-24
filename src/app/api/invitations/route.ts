// src/app/api/invitations/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 30
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all invitations with multi-channel analytics
export async function GET() {
  console.log('=== INVITATIONS LIST API START ===')
  
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json([], { status: 200 })
    }

    // Test connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected')

    // Fetch invitations with all channel logs
    const invitations = await prisma.invitation.findMany({
      include: {
        emailLogs: {
          include: {
            student: { select: { name: true, email: true, course: true, year: true } },
            guest: { select: { name: true, email: true, organization: true, designation: true } },
            professor: { select: { name: true, email: true, college: true, department: true } }
          }
        },
        smsLogs: {
          include: {
            student: { select: { name: true, phone: true, course: true, year: true } },
            guest: { select: { name: true, phone: true, organization: true, designation: true } },
            professor: { select: { name: true, phone: true, college: true, department: true } }
          }
        },
        whatsappLogs: {
          include: {
            student: { select: { name: true, phone: true, course: true, year: true } },
            guest: { select: { name: true, phone: true, organization: true, designation: true } },
            professor: { select: { name: true, phone: true, college: true, department: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Calculate multi-channel analytics
    const invitationsWithAnalytics = invitations.map((invitation) => {
      const emailLogs = invitation.emailLogs || []
      const smsLogs = invitation.smsLogs || []
      const whatsappLogs = invitation.whatsappLogs || []
      
      // Combine all logs for total analytics
      const allLogs = [...emailLogs, ...smsLogs, ...whatsappLogs]
      
      const analytics = {
        // Total counts
        totalSent: allLogs.length,
        delivered: allLogs.filter(log => log.status === 'delivered').length,
        opened: allLogs.filter(log => log.status === 'opened').length,
        clicked: allLogs.filter(log => log.status === 'clicked').length,
        failed: allLogs.filter(log => log.status === 'failed').length,
        pending: allLogs.filter(log => log.status === 'sent').length,
        
        // Channel-wise counts
        email: {
          sent: emailLogs.length,
          delivered: emailLogs.filter(log => log.status === 'delivered').length,
          opened: emailLogs.filter(log => log.status === 'opened').length,
          failed: emailLogs.filter(log => log.status === 'failed').length
        },
        sms: {
          sent: smsLogs.length,
          delivered: smsLogs.filter(log => log.status === 'delivered').length,
          failed: smsLogs.filter(log => log.status === 'failed').length
        },
        whatsapp: {
          sent: whatsappLogs.length,
          delivered: whatsappLogs.filter(log => log.status === 'delivered').length,
          read: whatsappLogs.filter(log => log.status === 'read').length,
          failed: whatsappLogs.filter(log => log.status === 'failed').length
        }
      }

      return {
        ...invitation,
        analytics: {
          ...analytics,
          deliveryRate: analytics.totalSent > 0 
            ? ((analytics.delivered / analytics.totalSent) * 100).toFixed(1)
            : '0',
          openRate: analytics.totalSent > 0 
            ? ((analytics.opened / analytics.totalSent) * 100).toFixed(1)
            : '0'
        }
      }
    })

    console.log(`✅ Returning ${invitationsWithAnalytics.length} invitations with multi-channel analytics`)
    
    return NextResponse.json(invitationsWithAnalytics, {
      headers: { 'Cache-Control': 'no-cache' }
    })

  } catch (error) {
    console.error('❌ Invitations API Error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// POST - Create new invitation  
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { title, subject, content } = body

    if (!title?.trim() || !subject?.trim() || !content?.trim()) {
      return NextResponse.json({
        error: 'Title, subject, and content are required'
      }, { status: 400 })
    }

    const invitation = await prisma.invitation.create({
      data: {
        title: title.trim(),
        subject: subject.trim(),
        content: content.trim(),
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        failedCount: 0
      }
    })

    return NextResponse.json(invitation, { status: 201 })

  } catch (error) {
    console.error('❌ Create Invitation Error:', error)
    return NextResponse.json({
      error: 'Failed to create invitation'
    }, { status: 500 })
  }
}
