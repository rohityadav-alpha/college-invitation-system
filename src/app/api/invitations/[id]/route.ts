// src/app/api/invitations/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vercel Function Configuration
export const maxDuration = 30
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch single invitation with detailed logs
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log('=== INVITATION DETAIL API START ===')
  
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await context.params
    console.log('Fetching invitation with ID:', id)

    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      )
    }

    // Environment check
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL missing')
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 503 }
      )
    }

    // Test connection with timeout
    console.log('Testing database connection...')
    const connectionTest = await Promise.race([
      prisma.$queryRaw`SELECT 1 as test`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 8000)
      )
    ])
    console.log('✅ Database connected:', connectionTest)

    // Fetch invitation with timeout protection
    console.log('Fetching invitation data...')
    const invitation = await Promise.race([
      prisma.invitation.findUnique({
        where: { id: id.trim() },
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
            orderBy: { sentAt: 'desc' },
            take: 1000 // Limit for performance
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
            orderBy: { sentAt: 'desc' },
            take: 1000
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
            orderBy: { sentAt: 'desc' },
            take: 1000
          }
        }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 15000)
      )
    ])

    if (!invitation) {
      console.log('❌ Invitation not found:', id)
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    console.log(`✅ Successfully fetched invitation: ${invitation.title}`)
    console.log(`Email logs: ${invitation.emailLogs?.length || 0}`)
    console.log(`SMS logs: ${invitation.smsLogs?.length || 0}`)
    console.log(`WhatsApp logs: ${invitation.whatsappLogs?.length || 0}`)

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
      return NextResponse.json(
        { 
          error: 'Database timeout - please try again',
          code: 'TIMEOUT_ERROR'
        },
        { status: 504 }
      )
    }

    if (error?.code === 'P2024') {
      return NextResponse.json(
        { 
          error: 'Database connection pool exhausted',
          code: 'CONNECTION_ERROR'
        },
        { status: 503 }
      )
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
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

    // Validate ID
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { title, subject, content } = body

    if (!title?.trim() || !subject?.trim() || !content?.trim()) {
      return NextResponse.json(
        { 
          error: 'Title, subject, and content are required',
          details: {
            title: !title?.trim() ? 'Title is required' : null,
            subject: !subject?.trim() ? 'Subject is required' : null,
            content: !content?.trim() ? 'Content is required' : null
          }
        },
        { status: 400 }
      )
    }

    console.log('Updating invitation:', id)

    // Check if invitation exists first
    const existingInvitation = await Promise.race([
      prisma.invitation.findUnique({ where: { id: id.trim() } }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 8000)
      )
    ])

    if (!existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Update invitation
    const updatedInvitation = await Promise.race([
      prisma.invitation.update({
        where: { id: id.trim() },
        data: { 
          title: title.trim(), 
          subject: subject.trim(), 
          content: content.trim()
        }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Update timeout')), 10000)
      )
    ])

    console.log('✅ Invitation updated successfully')

    return NextResponse.json(updatedInvitation, {
      headers: { 'Cache-Control': 'no-cache' }
    })

  } catch (error) {
    console.error('❌ Update Invitation Error:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      timestamp: new Date().toISOString()
    })
    
    if (error?.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Update operation timed out' },
        { status: 504 }
      )
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to update invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
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

    // Validate ID
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid invitation ID' },
        { status: 400 }
      )
    }

    console.log('Deleting invitation:', id)

    // Check if invitation exists
    const existingInvitation = await Promise.race([
      prisma.invitation.findUnique({ where: { id: id.trim() } }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 8000)
      )
    ])

    if (!existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Delete invitation (cascade deletes related logs automatically)
    await Promise.race([
      prisma.invitation.delete({ where: { id: id.trim() } }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Delete timeout')), 10000)
      )
    ])

    console.log('✅ Invitation deleted successfully')

    return NextResponse.json(
      { 
        message: 'Invitation deleted successfully',
        deletedId: id.trim()
      },
      { headers: { 'Cache-Control': 'no-cache' } }
    )

  } catch (error) {
    console.error('❌ Delete Invitation Error:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      timestamp: new Date().toISOString()
    })
    
    if (error?.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Delete operation timed out' },
        { status: 504 }
      )
    }

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to delete invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    console.log('=== DELETE INVITATION API END ===')
  }
}
