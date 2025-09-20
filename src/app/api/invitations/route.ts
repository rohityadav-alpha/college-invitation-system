import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all invitations with analytics
export async function GET() {
  try {
    const invitations = await prisma.invitation.findMany({
      include: {
        emailLogs: {
          include: {
            student: {
              select: {
                name: true,
                email: true,
                course: true,
                year: true
              }
            },
            guest: {
              select: {
                name: true,
                email: true,
                organization: true,
                designation: true
              }
            },
            professor: {
              select: {
                name: true,
                email: true,
                college: true,
                department: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate analytics for each invitation
    interface EmailLog {
      status: string;
      student?: { name: string; email: string; course: string; year: string };
      guest?: { name: string; email: string; organization: string; designation: string };
      professor?: { name: string; email: string; college: string; department: string };
    }

    interface Invitation {
      id: string;
      emailLogs: EmailLog[];
      createdAt: Date;
    }

    const invitationsWithAnalytics = invitations.map((invitation: Invitation) => {
      const logs = invitation.emailLogs as EmailLog[]
      
      return {
        ...invitation,
        analytics: {
          totalSent: logs.length,
          delivered: logs.filter(log => log.status === 'delivered').length,
          opened: logs.filter(log => log.status === 'opened').length,
          clicked: logs.filter(log => log.status === 'clicked').length,
          failed: logs.filter(log => log.status === 'failed').length,
          pending: logs.filter(log => log.status === 'sent').length,
          deliveryRate: logs.length > 0 ? (logs.filter(log => log.status === 'delivered').length / logs.length * 100).toFixed(1) : 0,
          openRate: logs.length > 0 ? (logs.filter(log => log.status === 'opened').length / logs.length * 100).toFixed(1) : 0
        }
      }
    })

    return NextResponse.json(invitationsWithAnalytics)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}
