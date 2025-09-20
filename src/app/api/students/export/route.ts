import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const course = searchParams.get('course')
    const year = searchParams.get('year')

    const whereClause: any = {}
    if (course) whereClause.course = course
    if (year) whereClause.year = year

    const students = await prisma.student.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    })

    // Generate CSV
    const headers = ['name', 'email', 'course', 'year', 'phone', 'createdAt']
    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        student.name,
        student.email,
        student.course,
        student.year,
        student.phone || '',
        student.createdAt.toISOString().split('T')[0]
      ].join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="students_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error: any) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Failed to export CSV: ' + error.message },
      { status: 500 }
    )
  }
}
