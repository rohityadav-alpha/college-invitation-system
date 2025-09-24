// src/app/api/invitations/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const maxDuration = 30
export const runtime = 'nodejs' 
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('=== INVITATION DETAIL API START ===')
  
  try {
    const { id } = await context.params
    console.log('Fetching invitation with ID:', id)

    // Environment check
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL missing')
      return NextResponse.json({
        error: 'Database not configured'
      }, { status: 503 })
    }

    // Test connection
    console.log('Testing database connection...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connected successfully')

    // Fetch invitation with ONLY existing relations
    console.log('Fetching invitation data...')
    const invitation = await prisma.invitation.findUnique({
      where: { id },
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
          orderBy: { sentAt: 'desc' },
          take: 100 // Limit for performance
        }
        // ❌ REMOVED smsLogs and whatsappLogs - they don't exist in schema
      }
    })

    if (!invitation) {
      console.log('❌ Invitation not found:', id)
      return NextResponse.json({
        error: 'Invitation not found'
      }, { status: 404 })
    }

    console.log(`✅ Successfully fetched invitation: ${invitation.title}`)
    console.log(`Email logs count: ${invitation.emailLogs?.length || 0}`)

    return NextResponse.json(invitation, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ Invitation Detail API Error:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      timestamp: new Date().toISOString()
    })

    // Handle different error types
    if (error?.message?.includes('timeout')) {
      return NextResponse.json({
        error: 'Database timeout - please try again'
      }, { status: 504 })
    }

    if (error?.code === 'P2025') {
      return NextResponse.json({
        error: 'Invitation not found'
      }, { status: 404 })
    }

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
  console.log('=== UPDATE INVITATION API START ===')
  
  try {
    const { id } = await context.params
    const body = await request.json().catch(() => null)
    
    if (!body) {
      return NextResponse.json({
        error: 'Invalid request body'
      }, { status: 400 })
    }

    const { title, subject, content } = body

    if (!title?.trim() || !subject?.trim() || !content?.trim()) {
      return NextResponse.json({
        error: 'Title, subject, and content are required'
      }, { status: 400 })
    }

    // Check if invitation exists
    const existingInvitation = await prisma.invitation.findUnique({
      where: { id }
    })

    if (!existingInvitation) {
      return NextResponse.json({
        error: 'Invitation not found'
      }, { status: 404 })
    }

    // Update invitation
    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: { 
        title: title.trim(), 
        subject: subject.trim(), 
        content: content.trim()
      }
    })

    console.log('✅ Invitation updated successfully')

    return NextResponse.json(updatedInvitation, {
      headers: { 'Cache-Control': 'no-cache' }
    })

  } catch (error) {
    console.error('❌ Update Invitation Error:', error)
    
    if (error?.code === 'P2025') {
      return NextResponse.json({
        error: 'Invitation not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      error: 'Failed to update invitation'
    }, { status: 500 })
  } finally {
    console.log('=== UPDATE INVITATION API END ===')
  }
}

// DELETE - Delete invitation
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('=== DELETE INVITATION API START ===')
  
  try {
    const { id } = await context.params

    // Check if invitation exists
    const existingInvitation = await prisma.invitation.findUnique({
      where: { id }
    })

    if (!existingInvitation) {
      return NextResponse.json({
        error: 'Invitation not found'
      }, { status: 404 })
    }

    // Delete invitation
    await prisma.invitation.delete({ 
      where: { id } 
    })

    console.log('✅ Invitation deleted successfully')

    return NextResponse.json({
      message: 'Invitation deleted successfully',
      deletedId: id
    }, { headers: { 'Cache-Control': 'no-cache' } })

  } catch (error) {
    console.error('❌ Delete Invitation Error:', error)
    
    if (error?.code === 'P2025') {
      return NextResponse.json({
        error: 'Invitation not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      error: 'Failed to delete invitation'
    }, { status: 500 })
  } finally {
    console.log('=== DELETE INVITATION API END ===')
  }
}
