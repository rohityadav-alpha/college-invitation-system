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
      return NextResponse.json({ error: 'CSV must have header and at least one data row' }, { status: 400 })
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim())
    const requiredHeaders = ['name', 'email', 'course', 'year']
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required headers: ${missingHeaders.join(', ')}. Required: name, email, course, year` 
      }, { status: 400 })
    }

    const students = []
    const errors = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const student: any = {}
      
      headers.forEach((header, index) => {
        student[header] = values[index] || ''
      })

      // Validation
      if (!student.name || !student.email || !student.course || !student.year) {
        errors.push(`Row ${i + 1}: Missing required fields`)
        continue
      }

      if (!student.email.includes('@')) {
        errors.push(`Row ${i + 1}: Invalid email format`)
        continue
      }

      students.push({
        name: student.name,
        email: student.email.toLowerCase(),
        course: student.course,
        year: student.year,
        phone: student.phone || ''
      })
    }

    if (errors.length > 0 && students.length === 0) {
      return NextResponse.json({ error: 'All rows have errors', errors }, { status: 400 })
    }

    // Import students (ignore duplicates)
    let successCount = 0
    let duplicateCount = 0

    for (const student of students) {
      try {
        await prisma.student.create({
          data: student
        })
        successCount++
      } catch (error: any) {
        if (error.code === 'P2002') {
          duplicateCount++
        } else {
          errors.push(`Failed to create student ${student.name}: ${error.message}`)
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
    console.error('CSV import error:', error)
    return NextResponse.json(
      { error: 'Failed to import CSV: ' + error.message },
      { status: 500 }
    )
  }
}
