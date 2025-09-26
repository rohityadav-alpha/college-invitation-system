import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const analytics = await prisma.emailLog.groupBy({
      by: ['status'],
      _count: { id: true }
    })
    
    const stats = {
      totalSent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      failed: 0
    }
    
    analytics.forEach(stat => {
      const count = stat._count.id
      switch (stat.status) {
        case 'sent':
          stats.totalSent += count
          break
        case 'delivered':
          stats.delivered += count
          break
        case 'opened':
          stats.opened += count
          break
        case 'clicked':
          stats.clicked += count
          break
        case 'failed':
        case 'bounced':
        case 'spam':
          stats.failed += count
          break
      }
    })
    
    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
