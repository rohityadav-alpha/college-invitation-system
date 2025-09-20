import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - Remove student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.student.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}

// PUT - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, email, course, year, phone } = await request.json()
    
    const student = await prisma.student.update({
      where: { id: params.id },
      data: { name, email, course, year, phone }
    })
    
    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}
