import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const college = searchParams.get('college')
    const department = searchParams.get('department')
    const designation = searchParams.get('designation')

    const whereClause: any = {}
    if (college) whereClause.college = college
    if (department) whereClause.department = department
    if (designation) whereClause.designation = designation

    const professors = await prisma.professor.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    })

    // Generate CSV
    const headers = ['name', 'email', 'college', 'department', 'designation', 'phone', 'expertise', 'createdAt']
    const csvContent = [
      headers.join(','),
      ...professors.map(professor => [
        professor.name,
        professor.email,
        professor.college,
        professor.department,
        professor.designation,
        professor.phone || '',
        professor.expertise || '',
        professor.createdAt.toISOString().split('T')[0]
      ].join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="professors_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error: any) {
    console.error('Professor CSV export error:', error)
    return NextResponse.json(
      { error: 'Failed to export CSV: ' + error.message },
      { status: 500 }
    )
  }
}
