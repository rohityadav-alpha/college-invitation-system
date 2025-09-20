import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch single invitation with detailed logs
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: params.id },
      include: {
        emailLogs: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                course: true,
                year: true
              }
            },
            guest: {
              select: {
                id: true,
                name: true,
                email: true,
                organization: true,
                designation: true
              }
            },
            professor: {
              select: {
                id: true,
                name: true,
                email: true,
                college: true,
                department: true
              }
            }
          },
          orderBy: { sentAt: 'desc' }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(invitation)
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    )
  }
}
