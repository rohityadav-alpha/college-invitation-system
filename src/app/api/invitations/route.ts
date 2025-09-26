// src/app/api/invitations/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Vercel Function Configuration
export const maxDuration = 30
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch all invitations with analytics
export async function GET() {
  console.log('=== INVITATIONS LIST API START ===')
  
  try {
    // Environment validation
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable missing')
      return NextResponse.json([], { 
        status: 200,
        headers: { 'Cache-Control': 'no-cache' }
      })
    }

    console.log('Testing database connection...')
    
    // Test database connection with timeout
    const connectionTest = await Promise.race([
      prisma.$queryRaw`SELECT 1 as test`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), 10000)
      )
    ])
    
    console.log('✅ Database connected successfully:', connectionTest)

    // Fetch invitations with timeout protection
    console.log('Fetching invitations from database...')
    const invitations = await Promise.race([
      prisma.invitation.findMany({
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
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit for performance
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 20000)
      )
    ])

    console.log(`Found ${invitations?.length || 0} invitations`)

    // Calculate analytics for each invitation with safety checks
    const invitationsWithAnalytics = (invitations || []).map((invitation) => {
      const logs = invitation?.emailLogs || []
      
      const analytics = {
        totalSent: logs.length,
        delivered: logs.filter(log => log?.status === 'delivered').length,
        opened: logs.filter(log => log?.status === 'opened').length,
        clicked: logs.filter(log => log?.status === 'clicked').length,
        failed: logs.filter(log => log?.status === 'failed').length,
        pending: logs.filter(log => log?.status === 'sent').length,
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

    console.log(`✅ Returning ${invitationsWithAnalytics.length} processed invitations`)

    return NextResponse.json(invitationsWithAnalytics, {
      status: 200,
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ Invitations List API Error:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      timestamp: new Date().toISOString(),
      env_check: {
        DATABASE_URL_exists: !!process.env.DATABASE_URL,
        DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,
        NODE_ENV: process.env.NODE_ENV
      }
    })

    // Handle specific error types
    if (error?.message?.includes('timeout')) {
      console.error('Database timeout occurred')
      return NextResponse.json([], { 
        status: 200,
        headers: { 'Cache-Control': 'no-cache' }
      })
    }

    if (error?.code === 'P2024') {
      console.error('Database connection pool exhausted')
      return NextResponse.json([], { 
        status: 200,
        headers: { 'Cache-Control': 'no-cache' }
      })
    }

    // Always return empty array to prevent frontend crashes
    return NextResponse.json([], { 
      status: 200,
      headers: { 'Cache-Control': 'no-cache' }
    })

  } finally {
    console.log('=== INVITATIONS LIST API END ===')
  }
}

// POST - Create new invitation
export async function POST(request: NextRequest) {
  console.log('=== CREATE INVITATION API START ===')
  
  try {
    // Environment validation
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured' }, 
        { status: 503 }
      )
    }

    // Parse request body with validation
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400 }
      )
    }

    const { title, subject, content } = body

    // Validate required fields
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

    console.log('Creating new invitation:', { title: title.trim() })

    // Create invitation with timeout
    const invitation = await Promise.race([
      prisma.invitation.create({
        data: {
          title: title.trim(),
          subject: subject.trim(),
          content: content.trim(),
          sentCount: 0
        }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Create operation timeout')), 15000)
      )
    ])

    console.log('✅ Invitation created successfully:', invitation.id)

    return NextResponse.json(invitation, { 
      status: 201,
      headers: { 'Cache-Control': 'no-cache' }
    })

  } catch (error) {
    console.error('❌ Create Invitation Error:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      timestamp: new Date().toISOString()
    })

    if (error?.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Create operation timed out - please try again' }, 
        { status: 504 }
      )
    }

    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'An invitation with similar details already exists' }, 
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to create invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  } finally {
    console.log('=== CREATE INVITATION API END ===')
  }
}
