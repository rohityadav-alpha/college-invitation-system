import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all invitations with analytics
export async function GET() {
  try {
    console.log('Fetching invitations...')
    
    // Test database connection first
    await prisma.$queryRaw`SELECT 1`
    
    const invitations = await prisma.invitation.findMany({
      include: {
        emailLogs: {
          include: {
            student: {
              select: { name: true, email: true, course: true, year: true }
            },
            guest: {
              select: { name: true, email: true, organization: true, designation: true }
            },
            professor: {
              select: { name: true, email: true, college: true, department: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate analytics for each invitation
    const invitationsWithAnalytics = (invitations || []).map((invitation) => {
      const logs = invitation.emailLogs || []
      
      return {
        ...invitation,
        analytics: {
          totalSent: logs.length,
          delivered: logs.filter(log => log.status === 'delivered').length,
          opened: logs.filter(log => log.status === 'opened').length,
          clicked: logs.filter(log => log.status === 'clicked').length,
          failed: logs.filter(log => log.status === 'failed').length,
          pending: logs.filter(log => log.status === 'sent').length,
          deliveryRate: logs.length > 0 
            ? ((logs.filter(log => log.status === 'delivered').length / logs.length) * 100).toFixed(1)
            : '0',
          openRate: logs.length > 0 
            ? ((logs.filter(log => log.status === 'opened').length / logs.length) * 100).toFixed(1)
            : '0'
        }
      }
    })

    console.log(`Returning ${invitationsWithAnalytics.length} invitations`)
    
    // Always return an array, never null or undefined
    return NextResponse.json(invitationsWithAnalytics)

  } catch (error) {
    console.error('Error fetching invitations:', {
      message: error?.message || 'Unknown error',
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
      env_check: {
        DATABASE_URL_exists: !!process.env.DATABASE_URL,
        DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,
        NODE_ENV: process.env.NODE_ENV
      }
    })
    
    // Return empty array instead of error to prevent frontend crash
    // This prevents the "e.map is not a function" error
    return NextResponse.json([], { status: 200 })
  }
}

// POST - Create new invitation
export async function POST(request: NextRequest) {
  try {
    const { title, subject, content } = await request.json()
    
    if (!title || !subject || !content) {
      return NextResponse.json(
        { error: 'Title, subject, and content are required' }, 
        { status: 400 }
      )
    }

    const invitation = await prisma.invitation.create({
      data: {
        title: title.trim(),
        subject: subject.trim(),
        content: content.trim(),
        sentCount: 0
      }
    })

    return NextResponse.json(invitation, { status: 201 })

  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' }, 
      { status: 500 }
    )
  }
}
