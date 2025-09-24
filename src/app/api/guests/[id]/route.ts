import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch single guest
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await context.params
    
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        emailLogs: {
          select: {
            id: true,
            status: true,
            sentAt: true,
            deliveredAt: true,
            openedAt: true,
            clickedAt: true,
            errorMessage: true,
            invitation: {
              select: {
                id: true,
                title: true,
                subject: true
              }
            }
          },
          orderBy: { sentAt: 'desc' }
        },
        smsLogs: {
          select: {
            id: true,
            status: true,
            sentAt: true,
            deliveredAt: true,
            errorMessage: true,
            invitation: {
              select: {
                id: true,
                title: true,
                subject: true
              }
            }
          },
          orderBy: { sentAt: 'desc' }
        },
        whatsappLogs: {
          select: {
            id: true,
            status: true,
            sentAt: true,
            deliveredAt: true,
            readAt: true,
            errorMessage: true,
            invitation: {
              select: {
                id: true,
                title: true,
                subject: true
              }
            }
          },
          orderBy: { sentAt: 'desc' }
        }
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json(guest)
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guest' }, 
      { status: 500 }
    )
  }
}

// PUT - Update guest
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { name, email, organization, designation, category, phone } = await request.json()

    // Validate required fields
    if (!name || !email || !organization || !designation) {
      return NextResponse.json(
        { error: 'Name, email, organization, and designation are required' }, 
        { status: 400 }
      )
    }

    // Check if guest exists
    const existingGuest = await prisma.guest.findUnique({
      where: { id }
    })

    if (!existingGuest) {
      return NextResponse.json(
        { error: 'Guest not found' }, 
        { status: 404 }
      )
    }

    // Check email uniqueness (excluding current guest)
    const emailExists = await prisma.guest.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    })

    if (emailExists) {
      return NextResponse.json(
        { error: 'Guest with this email already exists' }, 
        { status: 409 }
      )
    }

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: {
        name,
        email,
        organization,
        designation,
        category: category || 'guest',
        phone: phone || null
      }
    })

    return NextResponse.json(updatedGuest)
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json(
      { error: 'Failed to update guest' }, 
      { status: 500 }
    )
  }
}

// DELETE - Delete guest
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check if guest exists
    const existingGuest = await prisma.guest.findUnique({
      where: { id }
    })

    if (!existingGuest) {
      return NextResponse.json(
        { error: 'Guest not found' }, 
        { status: 404 }
      )
    }

    await prisma.guest.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Guest deleted successfully' }
    )
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json(
      { error: 'Failed to delete guest' }, 
      { status: 500 }
    )
  }
}
