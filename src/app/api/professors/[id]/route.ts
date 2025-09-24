import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch single professor
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await context.params
    
    const professor = await prisma.professor.findUnique({
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

    if (!professor) {
      return NextResponse.json(
        { error: 'Professor not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json(professor)
  } catch (error) {
    console.error('Error fetching professor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch professor' }, 
      { status: 500 }
    )
  }
}

// PUT - Update professor
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { name, email, college, department, designation, phone, expertise } = await request.json()

    // Validate required fields
    if (!name || !email || !college || !department) {
      return NextResponse.json(
        { error: 'Name, email, college, and department are required' }, 
        { status: 400 }
      )
    }

    // Check if professor exists
    const existingProfessor = await prisma.professor.findUnique({
      where: { id }
    })

    if (!existingProfessor) {
      return NextResponse.json(
        { error: 'Professor not found' }, 
        { status: 404 }
      )
    }

    // Check email uniqueness (excluding current professor)
    const emailExists = await prisma.professor.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    })

    if (emailExists) {
      return NextResponse.json(
        { error: 'Professor with this email already exists' }, 
        { status: 409 }
      )
    }

    const updatedProfessor = await prisma.professor.update({
      where: { id },
      data: {
        name,
        email,
        college,
        department,
        designation: designation || 'Professor',
        phone: phone || null,
        expertise: expertise || null
      }
    })

    return NextResponse.json(updatedProfessor)
  } catch (error) {
    console.error('Error updating professor:', error)
    return NextResponse.json(
      { error: 'Failed to update professor' }, 
      { status: 500 }
    )
  }
}

// DELETE - Delete professor
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check if professor exists
    const existingProfessor = await prisma.professor.findUnique({
      where: { id }
    })

    if (!existingProfessor) {
      return NextResponse.json(
        { error: 'Professor not found' }, 
        { status: 404 }
      )
    }

    await prisma.professor.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Professor deleted successfully' }
    )
  } catch (error) {
    console.error('Error deleting professor:', error)
    return NextResponse.json(
      { error: 'Failed to delete professor' }, 
      { status: 500 }
    )
  }
}
