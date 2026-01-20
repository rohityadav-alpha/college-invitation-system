import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all guests
export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(guests)
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guests' },
      { status: 500 }
    )
  }
}

// POST - Add new guest
export async function POST(request: NextRequest) {
  try {
    const { name, email, organization, designation, category, phone } = await request.json()

    if (!name || !email || !organization || !designation) {
      return NextResponse.json(
        { error: 'Name, email, organization, and designation are required' },
        { status: 400 }
      )
    }

    // Check if guest already exists
    const existingGuest = await prisma.guest.findUnique({
      where: { email }
    })

    if (existingGuest) {
      return NextResponse.json(
        { error: 'Guest with this email already exists' },
        { status: 409 }
      )
    }

    const guest = await prisma.guest.create({
      data: {
        name,
        email,
        organization,
        designation,
        category: category || 'guest',
        phone: phone || null
      }
    })

    return NextResponse.json(guest, { status: 201 })
  } catch (error) {
    console.error('Error adding guest:', error)
    return NextResponse.json(
      { error: 'Failed to add guest' },
      { status: 500 }
    )
  }
}

// PUT - Update guest
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Guest ID is required' },
        { status: 400 }
      )
    }

    const { name, email, organization, designation, category, phone } = await request.json()

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

    // Check if email is taken by another guest
    const emailTaken = await prisma.guest.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    })

    if (emailTaken) {
      return NextResponse.json(
        { error: 'Email already taken by another guest' },
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

// DELETE - Remove guest
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Guest ID is required' },
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

    // Check if guest has email logs
    const emailLogs = await prisma.emailLog.count({
      where: { guestId: id }
    })

    if (emailLogs > 0) {
      return NextResponse.json(
        { error: `Cannot delete guest. ${emailLogs} email records found. Please archive instead.` },
        { status: 409 }
      )
    }

    await prisma.guest.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Guest deleted successfully',
      deletedGuest: existingGuest
    })
  } catch (error) {
    console.error('Error deleting guest:', error)
    return NextResponse.json(
      { error: 'Failed to delete guest' },
      { status: 500 }
    )
  }
}
