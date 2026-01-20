import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

// POST - Add new student
export async function POST(request: NextRequest) {
  try {
    const { name, email, course, year, phone } = await request.json()

    if (!name || !email || !course || !year) {
      return NextResponse.json(
        { error: 'Name, email, course, and year are required' },
        { status: 400 }
      )
    }

    // Check if student already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Student with this email already exists' },
        { status: 409 }
      )
    }

    const student = await prisma.student.create({
      data: {
        name,
        email,
        course,
        year,
        phone: phone || null
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error adding student:', error)
    return NextResponse.json(
      { error: 'Failed to add student' },
      { status: 500 }
    )
  }
}

// PUT - Update student
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const { name, email, course, year, phone } = await request.json()

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

    // Check if email is taken by another student
    const emailTaken = await prisma.student.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    })

    if (emailTaken) {
      return NextResponse.json(
        { error: 'Email already taken by another student' },
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

// DELETE - Remove student
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
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

    // Check if student has email logs (optional - remove if you want to allow deletion)
    const emailLogs = await prisma.emailLog.count({
      where: { studentId: id }
    })

    if (emailLogs > 0) {
      return NextResponse.json(
        { error: `Cannot delete student. ${emailLogs} email records found. Please archive instead.` },
        { status: 409 }
      )
    }

    await prisma.student.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
      deletedStudent: existingStudent
    })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}
