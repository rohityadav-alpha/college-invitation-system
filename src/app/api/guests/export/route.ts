import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organization = searchParams.get('organization')
    const category = searchParams.get('category')

    const whereClause: any = {}
    if (organization) whereClause.organization = organization
    if (category) whereClause.category = category

    const guests = await prisma.guest.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    })

    // Generate CSV
    const headers = ['name', 'email', 'organization', 'designation', 'phone', 'category', 'createdAt']
    const csvContent = [
      headers.join(','),
      ...guests.map(guest => [
        guest.name,
        guest.email,
        guest.organization || '',
        guest.designation || '',
        guest.phone || '',
        guest.category,
        guest.createdAt.toISOString().split('T')[0]
      ].join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="guests_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error: any) {
    console.error('Guest CSV export error:', error)
    return NextResponse.json(
      { error: 'Failed to export CSV: ' + error.message },
      { status: 500 }
    )
  }
}
