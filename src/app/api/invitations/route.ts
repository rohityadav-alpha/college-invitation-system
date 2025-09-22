// src/app/api/invitations/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
          },
          orderBy: { sentAt: 'desc' }  // ✅ Fixed: Use sentAt instead of createdAt
        },
        smsLogs: {
          include: {
            student: {
              select: {
                name: true,
                phone: true,
                course: true,
                year: true
              }
            },
            guest: {
              select: {
                name: true,
                phone: true,
                organization: true,
                designation: true
              }
            },
            professor: {
              select: {
                name: true,
                phone: true,
                college: true,
                department: true
              }
            }
          },
          orderBy: { sentAt: 'desc' }  // ✅ Fixed: Use sentAt instead of createdAt
        },
        whatsappLogs: {
          include: {
            student: {
              select: {
                name: true,
                phone: true,
                course: true,
                year: true
              }
            },
            guest: {
              select: {
                name: true,
                phone: true,
                organization: true,
                designation: true
              }
            },
            professor: {
              select: {
                name: true,
                phone: true,
                college: true,
                department: true
              }
            }
          },
          orderBy: { sentAt: 'desc' }  // ✅ Fixed: Use sentAt instead of createdAt
        }
      },
      orderBy: { createdAt: 'desc' }  // ✅ This is correct for Invitation model
    })

    // Calculate analytics for each invitation
    const invitationsWithAnalytics = invitations.map((invitation) => {
      const emailLogs = invitation.emailLogs || []
      const smsLogs = invitation.smsLogs || []
      const whatsappLogs = invitation.whatsappLogs || []
      
      // All communication logs combined
      const allLogs = [...emailLogs, ...smsLogs, ...whatsappLogs]

      return {
        ...invitation,
        analytics: {
          // Overall Summary
          totalSent: allLogs.length,
          delivered: allLogs.filter(log => ['delivered', 'opened', 'clicked', 'read'].includes(log.status)).length,
          failed: allLogs.filter(log => log.status === 'failed').length,
          pending: allLogs.filter(log => log.status === 'sent').length,
          
          // Channel-wise Analytics
          email: {
            totalSent: emailLogs.length,
            delivered: emailLogs.filter(log => log.status === 'delivered').length,
            opened: emailLogs.filter(log => log.status === 'opened').length,
            clicked: emailLogs.filter(log => log.status === 'clicked').length,
            failed: emailLogs.filter(log => log.status === 'failed').length,
            pending: emailLogs.filter(log => log.status === 'sent').length,
            deliveryRate: emailLogs.length > 0 ? ((emailLogs.filter(log => log.status === 'delivered').length / emailLogs.length) * 100).toFixed(1) : '0',
            openRate: emailLogs.length > 0 ? ((emailLogs.filter(log => log.status === 'opened').length / emailLogs.length) * 100).toFixed(1) : '0'
          },
          
          sms: {
            totalSent: smsLogs.length,
            delivered: smsLogs.filter(log => log.status === 'delivered').length,
            failed: smsLogs.filter(log => log.status === 'failed').length,
            pending: smsLogs.filter(log => log.status === 'sent').length,
            deliveryRate: smsLogs.length > 0 ? ((smsLogs.filter(log => log.status === 'delivered').length / smsLogs.length) * 100).toFixed(1) : '0'
          },
          
          whatsapp: {
            totalSent: whatsappLogs.length,
            delivered: whatsappLogs.filter(log => log.status === 'delivered').length,
            read: whatsappLogs.filter(log => log.status === 'read').length,
            failed: whatsappLogs.filter(log => log.status === 'failed').length,
            pending: whatsappLogs.filter(log => log.status === 'sent').length,
            deliveryRate: whatsappLogs.length > 0 ? ((whatsappLogs.filter(log => log.status === 'delivered').length / whatsappLogs.length) * 100).toFixed(1) : '0',
            readRate: whatsappLogs.length > 0 ? ((whatsappLogs.filter(log => log.status === 'read').length / whatsappLogs.length) * 100).toFixed(1) : '0'
          }
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
