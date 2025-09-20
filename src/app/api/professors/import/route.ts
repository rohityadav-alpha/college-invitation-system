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
    const requiredHeaders = ['name', 'email', 'college', 'department']
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}. Required: name, email, college, department` 
      }, { status: 400 })
    }

    const professors = []
    const errors = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const professor: any = {}
      
      headers.forEach((header, index) => {
        professor[header] = values[index] || ''
      })

      // Validation
      if (!professor.name || !professor.email || !professor.college || !professor.department) {
        errors.push(`Row ${i + 1}: Missing required fields`)
        continue
      }

      if (!professor.email.includes('@')) {
        errors.push(`Row ${i + 1}: Invalid email format`)
        continue
      }

      professors.push({
        name: professor.name,
        email: professor.email.toLowerCase(),
        college: professor.college,
        department: professor.department,
        designation: professor.designation || 'Professor',
        phone: professor.phone || '',
        expertise: professor.expertise || ''
      })
    }

    if (errors.length > 0 && professors.length === 0) {
      return NextResponse.json({ 
        error: 'All rows have errors', 
        errors 
      }, { status: 400 })
    }

    // Import professors (ignore duplicates)
    let successCount = 0
    let duplicateCount = 0

    for (const professor of professors) {
      try {
        await prisma.professor.create({
          data: professor
        })
        successCount++
      } catch (error: any) {
        if (error.code === 'P2002') {
          duplicateCount++
        } else {
          errors.push(`Failed to create professor ${professor.name}: ${error.message}`)
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
    console.error('Professor CSV import error:', error)
    return NextResponse.json(
      { error: 'Failed to import CSV: ' + error.message },
      { status: 500 }
    )
  }
}
