import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all professors
export async function GET() {
  try {
    const professors = await prisma.professor.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(professors)
  } catch (error) {
    console.error('Error fetching professors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch professors' },
      { status: 500 }
    )
  }
}

// POST - Add new professor
export async function POST(request: NextRequest) {
  try {
    const { name, email, college, department, designation, phone, expertise } = await request.json()

    if (!name || !email || !college || !department) {
      return NextResponse.json(
        { error: 'Name, email, college, and department are required' },
        { status: 400 }
      )
    }

    // Check if professor already exists
    const existingProfessor = await prisma.professor.findUnique({
      where: { email }
    })

    if (existingProfessor) {
      return NextResponse.json(
        { error: 'Professor with this email already exists' },
        { status: 409 }
      )
    }

    const professor = await prisma.professor.create({
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

    return NextResponse.json(professor, { status: 201 })
  } catch (error) {
    console.error('Error adding professor:', error)
    return NextResponse.json(
      { error: 'Failed to add professor' },
      { status: 500 }
    )
  }
}

// PUT - Update professor
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Professor ID is required' },
        { status: 400 }
      )
    }

    const { name, email, college, department, designation, phone, expertise } = await request.json()

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

    // Check if email is taken by another professor
    const emailTaken = await prisma.professor.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    })

    if (emailTaken) {
      return NextResponse.json(
        { error: 'Email already taken by another professor' },
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

// DELETE - Remove professor
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Professor ID is required' },
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

    // Check if professor has email logs
    const emailLogs = await prisma.emailLog.count({
      where: { professorId: id }
    })

    if (emailLogs > 0) {
      return NextResponse.json(
        { error: `Cannot delete professor. ${emailLogs} email records found. Please archive instead.` },
        { status: 409 }
      )
    }

    await prisma.professor.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Professor deleted successfully',
      deletedProfessor: existingProfessor
    })
  } catch (error) {
    console.error('Error deleting professor:', error)
    return NextResponse.json(
      { error: 'Failed to delete professor' },
      { status: 500 }
    )
  }
}
