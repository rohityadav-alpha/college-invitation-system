import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const csvText = await file.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json({ 
        error: 'CSV must have header and at least one data row' 
      }, { status: 400 })
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim())
    const requiredHeaders = ['name', 'email', 'organization', 'designation']
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}. Required: name, email, organization, designation` 
      }, { status: 400 })
    }

    const guests = []
    const errors = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const guest: any = {}
      
      headers.forEach((header, index) => {
        guest[header] = values[index] || ''
      })

      // Validation
      if (!guest.name || !guest.email || !guest.organization || !guest.designation) {
        errors.push(`Row ${i + 1}: Missing required fields`)
        continue
      }

      if (!guest.email.includes('@')) {
        errors.push(`Row ${i + 1}: Invalid email format`)
        continue
      }

      guests.push({
        name: guest.name,
        email: guest.email.toLowerCase(),
        organization: guest.organization,
        designation: guest.designation,
        phone: guest.phone || '',
        category: guest.category || 'guest'
      })
    }

    if (errors.length > 0 && guests.length === 0) {
      return NextResponse.json({ 
        error: 'All rows have errors', 
        errors 
      }, { status: 400 })
    }

    // Import guests (ignore duplicates)
    let successCount = 0
    let duplicateCount = 0

    for (const guest of guests) {
      try {
        await prisma.guest.create({
          data: guest
        })
        successCount++
      } catch (error: any) {
        if (error.code === 'P2002') {
          duplicateCount++
        } else {
          errors.push(`Failed to create guest ${guest.name}: ${error.message}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${successCount} imported, ${duplicateCount} duplicates skipped`,
      imported: successCount,
      duplicates: duplicateCount,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error: any) {
    console.error('Guest CSV import error:', error)
    return NextResponse.json(
      { error: 'Failed to import CSV: ' + error.message },
      { status: 500 }
    )
  }
}
