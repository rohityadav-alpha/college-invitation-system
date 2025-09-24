// src\app\api\invitations\[id]\route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch single invitation with detailed logs
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await context.params
    
    console.log('Fetching invitation with ID:', id)
    
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        emailLogs: {
          include: {
            student: {
              select: { id: true, name: true, email: true, course: true, year: true }
            },
            guest: {
              select: { id: true, name: true, email: true, organization: true, designation: true }
            },
            professor: {
              select: { id: true, name: true, email: true, college: true, department: true }
            }
          },
          orderBy: { sentAt: 'desc' }
        },
        smsLogs: {
          include: {
            student: {
              select: { id: true, name: true, phone: true, course: true, year: true }
            },
            guest: {
              select: { id: true, name: true, phone: true, organization: true, designation: true }
            },
            professor: {
              select: { id: true, name: true, phone: true, college: true, department: true }
            }
          },
          orderBy: { sentAt: 'desc' }
        },
        whatsappLogs: {
          include: {
            student: {
              select: { id: true, name: true, phone: true, course: true, year: true }
            },
            guest: {
              select: { id: true, name: true, phone: true, organization: true, designation: true }
            },
            professor: {
              select: { id: true, name: true, phone: true, college: true, department: true }
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

    console.log(`Successfully fetched invitation: ${invitation.title}`)
    return NextResponse.json(invitation)
    
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}

// PUT - Update invitation
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { title, subject, content } = await request.json()

    if (!title || !subject || !content) {
      return NextResponse.json(
        { error: 'Title, subject, and content are required' }, 
        { status: 400 }
      )
    }

    const existingInvitation = await prisma.invitation.findUnique({
      where: { id }
    })

    if (!existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation not found' }, 
        { status: 404 }
      )
    }

    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: { title, subject, content }
    })

    return NextResponse.json(updatedInvitation)
  } catch (error) {
    console.error('Error updating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to update invitation' }, 
      { status: 500 }
    )
  }
}

// DELETE - Delete invitation
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const existingInvitation = await prisma.invitation.findUnique({
      where: { id }
    })

    if (!existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation not found' }, 
        { status: 404 }
      )
    }

    await prisma.invitation.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Invitation deleted successfully' }
    )
  } catch (error) {
    console.error('Error deleting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to delete invitation' }, 
      { status: 500 }
    )
  }
}
