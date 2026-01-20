import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch single student
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params first (Next.js 15 requirement)
    const { id } = await context.params
    
    const student = await prisma.student.findUnique({
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

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' }, 
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' }, 
      { status: 500 }
    )
  }
}

// PUT - Update student
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { name, email, course, year, phone } = await request.json()

    // Validate required fields
    if (!name || !email || !course || !year) {
      return NextResponse.json(
        { error: 'Name, email, course, and year are required' }, 
        { status: 400 }
      )
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' }, 
        { status: 404 }
      )
    }

    // Check email uniqueness (excluding current student)
    const emailExists = await prisma.student.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    })

    if (emailExists) {
      return NextResponse.json(
        { error: 'Student with this email already exists' }, 
        { status: 409 }
      )
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        name,
        email,
        course,
        year,
        phone: phone || null
      }
    })

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' }, 
      { status: 500 }
    )
  }
}

// DELETE - Delete student
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' }, 
        { status: 404 }
      )
    }

    await prisma.student.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Student deleted successfully' }
    )
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' }, 
      { status: 500 }
    )
  }
}
