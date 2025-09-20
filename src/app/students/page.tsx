// src/app/students/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import { AppIcons } from '@/components/icons/AppIcons'
import App from 'next/app'

interface Student {
  id: string
  name: string
  email: string
  course: string
  year: string
  phone?: string
  createdAt: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    year: '',
    phone: ''
  })

  // CSV import state
  const [csvData, setCsvData] = useState('')

  const courses = [
    'Computer Science', 'Information Technology', 'Electronics & Communication',
    'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
    'Business Administration', 'Commerce', 'Arts', 'Science'
  ]

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year']

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, courseFilter, yearFilter])

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      const data = await response.json()
      setStudents(data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const filterStudents = () => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (courseFilter) {
      filtered = filtered.filter(student => student.course === courseFilter)
    }

    if (yearFilter) {
      filtered = filtered.filter(student => student.year === yearFilter)
    }

    setFilteredStudents(filtered)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      course: '',
      year: '',
      phone: ''
    })
    setEditingStudent(null)
    setShowForm(false)
  }

  // CRUD Operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingStudent 
        ? `/api/students?id=${editingStudent.id}`
        : '/api/students'
      
      const method = editingStudent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ Student ${editingStudent ? 'updated' : 'added'} successfully!`)
        fetchStudents()
        resetForm()
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (student: Student) => {
    setFormData({
      name: student.name,
      email: student.email,
      course: student.course,
      year: student.year,
      phone: student.phone || ''
    })
    setEditingStudent(student)
    setShowForm(true)
  }

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.name}?\nThis action cannot be undone.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/students?id=${student.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ ${result.message}`)
        fetchStudents()
        setSelectedStudents(prev => prev.filter(id => id !== student.id))
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select students to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedStudents.length} selected students?\nThis action cannot be undone.`)) {
      return
    }

    setLoading(true)
    let successCount = 0
    let errorCount = 0

    for (const studentId of selectedStudents) {
      try {
        const response = await fetch(`/api/students?id=${studentId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        errorCount++
      }
    }

    alert(`Bulk delete completed: ${successCount} deleted, ${errorCount} failed`)
    fetchStudents()
    setSelectedStudents([])
    setLoading(false)
  }

  // CSV Import/Export Functions (Existing functionality preserved)
  const handleCSVImport = async () => {
    if (!csvData.trim()) {
      alert('Please enter CSV data')
      return
    }

    setLoading(true)
    try {
      const lines = csvData.trim().split('\n')
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
      
      // Validate headers
      const requiredHeaders = ['name', 'email', 'course', 'year']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        alert(`Missing required headers: ${missingHeaders.join(', ')}`)
        setLoading(false)
        return
      }

      let successCount = 0
      let errorCount = 0
      const errors = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const studentData: { [key: string]: string } = {}
        
        headers.forEach((header, index) => {
          studentData[header] = values[index] || ''
        })

        // Skip empty rows
        if (!studentData.name || !studentData.email) {
          continue
        }

        try {
          const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
          })

          if (response.ok) {
            successCount++
          } else {
            const result = await response.json()
            errorCount++
            errors.push(`Row ${i + 1}: ${result.error}`)
          }
        } catch (error) {
          errorCount++
          errors.push(`Row ${i + 1}: Network error`)
        }
      }

      alert(`CSV Import completed!\nSuccess: ${successCount}\nErrors: ${errorCount}${errors.length > 0 ? '\n\nErrors:\n' + errors.slice(0, 5).join('\n') : ''}`)
      
      if (successCount > 0) {
        fetchStudents()
      }
      
      setShowImportModal(false)
      setCsvData('')
    } catch (error) {
      alert('❌ Error processing CSV data')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (students.length === 0) {
      alert('No students to export')
      return
    }

    const csvContent = [
      ['name', 'email', 'course', 'year', 'phone', 'createdAt'].join(','),
      ...students.map(student => [
        student.name,
        student.email,
        student.course,
        student.year,
        student.phone || '',
        new Date(student.createdAt).toISOString().split('T')[0]
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Selection functions
  const selectAllVisible = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const selectAll = () => {
    setSelectedStudents(selectedStudents.length === students.length ? [] : students.map(s => s.id))
  }

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gray-50 text-gray-700">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
            <div className="flex gap-3">
              {/* CSV Import/Export Buttons */}
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <AppIcons.Upload className="h-5 w-5 inline" />
                Import CSV
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <AppIcons.Download className="h-5 w-5 inline" />
                Export CSV
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <AppIcons.Guests className="h-5 w-5 inline" />
                Add Student
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <button
                onClick={() => {
                  setSearchTerm('')
                  setCourseFilter('')
                  setYearFilter('')
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                <AppIcons.Close className="h-5 w-5 inline" />
                Clear Filters
              </button>
            </div>

            {/* Enhanced Bulk Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedStudents.length === students.length ? <AppIcons.Close className="h-5 w-5 inline" /> : <AppIcons.Check className="h-5 w-5 inline" />}
                  {selectedStudents.length === students.length ? ' Deselect All' : ' Select All'}
                </button>
                
                <button
                  onClick={selectAllVisible}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedStudents.length === filteredStudents.length ? <AppIcons.Close className="h-5 w-5 inline" /> : <AppIcons.Check className="h-5 w-5 inline" />}
                  {selectedStudents.length === filteredStudents.length ? ' Deselect Visible' : ' Select Visible'}
                </button>
                
                {selectedStudents.length > 0 && (
                  <>
                    <button
                      onClick={handleBulkDelete}
                      disabled={loading}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                    >
                      <AppIcons.Delete className="h-5 w-5 inline" /> Delete Selected ({selectedStudents.length})
                    </button>
                    
                    <button
                      onClick={() => {
                        const selectedData = students.filter(s => selectedStudents.includes(s.id))
                        const csvContent = [
                          ['name', 'email', 'course', 'year', 'phone'].join(','),
                          ...selectedData.map(student => [
                            student.name,
                            student.email,
                            student.course,
                            student.year,
                            student.phone || ''
                          ].join(','))
                        ].join('\n')

                        const blob = new Blob([csvContent], { type: 'text/csv' })
                        const url = window.URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `selected-students-${new Date().toISOString().split('T')[0]}.csv`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        window.URL.revokeObjectURL(url)
                      }}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                      <AppIcons.Download className="h-5 w-5 inline" /> Export Selected
                    </button>
                  </>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Total:</strong> {students.length} | <strong>Filtered:</strong> {filteredStudents.length} | <strong>Selected:</strong> {selectedStudents.length}
              </p>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={selectAllVisible}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course & Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <div className="text-4xl mb-4"><AppIcons.Guests className="h-5 w-5 inline" /></div>
                          <p className="text-lg font-medium">No students found</p>
                          <p className="text-sm">
                            {students.length === 0 ? 'Start by adding your first student' : 'Try adjusting your search filters'}
                          </p>
                          {students.length === 0 && (
                            <div className="mt-4 flex justify-center gap-3">
                              <button
                                onClick={() => setShowForm(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                              >
                                Add First Student
                              </button>
                              <button
                                onClick={() => setShowImportModal(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                              >
                                Import from CSV
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents([...selectedStudents, student.id])
                              } else {
                                setSelectedStudents(selectedStudents.filter(id => id !== student.id))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <AppIcons.Guests className="h-5 w-5 inline" />
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.course}</div>
                          <div className="text-sm text-gray-500">{student.year}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <AppIcons.Edit className="h-5 w-5 inline" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:text-gray-400"
                            >
                              <AppIcons.Delete className="h-5 w-5 inline" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add/Edit Student Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">
                {editingStudent ? <AppIcons.Edit className="h-5 w-5 inline" /> : <AppIcons.Add className="h-5 w-5 inline" />}
                {editingStudent ? ' Edit Student' : ' Add New Student'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({...formData, course: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Course *</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
                
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Year *</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {loading ? (editingStudent ? 'Updating...' : 'Adding...') : (editingStudent ? 'Update Student' : 'Add Student')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-6"><AppIcons.Upload className="h-5 w-5 inline" /> Import Students from CSV</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Required CSV format:</strong>
                </p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  name,email,course,year,phone<br/>
                  John Doe,john@example.com,Computer Science,1st Year,9876543210<br/>
                  Jane Smith,jane@example.com,Information Technology,2nd Year,9876543211
                </div>
              </div>

              <textarea
                placeholder="Paste your CSV data here..."
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-48 font-mono text-sm"
                required
              />

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCSVImport}
                  disabled={loading || !csvData.trim()}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400"
                >
                  {loading ? 'Importing...' : 'Import Students'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false)
                    setCsvData('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtection>
  )
}
