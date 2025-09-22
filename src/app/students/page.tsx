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
     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-600">
      <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <AppIcons.Students size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Students Management</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your student database</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Enhanced CSV Import/Export Buttons */}
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-2 shadow-lg transition-all font-medium"
              >
                <AppIcons.Upload size={18} />
                <span className="text-sm sm:text-base">Import CSV</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 flex items-center justify-center gap-2 shadow-lg transition-all font-medium"
              >
                <AppIcons.Download size={18} />
                <span className="text-sm sm:text-base">Export CSV</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 shadow-lg transition-all font-medium"
              >
                <AppIcons.Students size={18} />
                <span className="text-sm sm:text-base">Add Student</span>
              </button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <AppIcons.Filter size={20} className="text-indigo-600" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Filters & Search</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative">
                <AppIcons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:from-gray-300 hover:to-gray-400 flex items-center justify-center gap-2 transition-all font-medium"
              >
                <AppIcons.Close size={16} />
                <span className="hidden sm:inline">Clear Filters</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>

            {/* Enhanced Bulk Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <button
                    onClick={selectAll}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-all font-medium"
                  >
                    {selectedStudents.length === students.length ? <AppIcons.Close size={14} /> : <AppIcons.Check size={14} />}
                    <span>{selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}</span>
                  </button>
                  
                  <button
                    onClick={selectAllVisible}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-all font-medium"
                  >
                    {selectedStudents.length === filteredStudents.length ? <AppIcons.Close size={14} /> : <AppIcons.Check size={14} />}
                    <span>{selectedStudents.length === filteredStudents.length ? 'Deselect Visible' : 'Select Visible'}</span>
                  </button>
                  
                  {selectedStudents.length > 0 && (
                    <>
                      <button
                        onClick={handleBulkDelete}
                        disabled={loading}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 transition-all font-medium shadow-lg flex items-center gap-1 sm:gap-2"
                      >
                        <AppIcons.Delete size={14} />
                        <span className="hidden sm:inline">Delete Selected ({selectedStudents.length})</span>
                        <span className="sm:hidden">Delete ({selectedStudents.length})</span>
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
                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:from-purple-700 hover:to-purple-800 transition-all font-medium shadow-lg flex items-center gap-1 sm:gap-2"
                      >
                        <AppIcons.Download size={14} />
                        <span className="hidden sm:inline">Export Selected</span>
                        <span className="sm:hidden">Export</span>
                      </button>
                    </>
                  )}
                </div>
                
                <div className="bg-white rounded-lg px-3 sm:px-4 py-2 shadow-inner border border-blue-200">
                  <p className="text-xs sm:text-sm text-gray-700 font-medium">
                    <span className="text-blue-600 font-bold">Total:</span> {students.length} | 
                    <span className="text-green-600 font-bold"> Filtered:</span> {filteredStudents.length} | 
                    <span className="text-purple-600 font-bold"> Selected:</span> {selectedStudents.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Students Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={selectAllVisible}
                        className="rounded border-gray-300 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Student Details</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Course & Year</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Added</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                        <div className="text-gray-500">
                          <div className="flex justify-center mb-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                              <AppIcons.Students size={48} className="text-gray-400" />
                            </div>
                          </div>
                          <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No students found</p>
                          <p className="text-sm sm:text-base text-gray-500 mb-6">
                            {students.length === 0 ? 'Start by adding your first student' : 'Try adjusting your search filters'}
                          </p>
                          {students.length === 0 && (
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                              <button
                                onClick={() => setShowForm(true)}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all font-medium"
                              >
                                Add First Student
                              </button>
                              <button
                                onClick={() => setShowImportModal(true)}
                                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg transition-all font-medium"
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
                      <tr key={student.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
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
                            className="rounded border-gray-300 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                              <AppIcons.Students size={16} className="text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm sm:text-base font-semibold text-gray-900">{student.name}</div>
                              <div className="text-xs sm:text-sm text-gray-600">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-sm sm:text-base font-medium text-gray-900">{student.course}</div>
                          <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 rounded-full px-2 py-1 inline-block">{student.year}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                            student.phone 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {student.phone || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg ">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all text-xs sm:text-sm font-medium"
                            >
                              <AppIcons.Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-all text-xs sm:text-sm font-medium disabled:text-gray-400 disabled:hover:bg-transparent"
                            >
                              <AppIcons.Delete size={14} />
                              <span>Delete</span>
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

        {/* Enhanced Add/Edit Student Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 max-h-screen overflow-y-auto shadow-2xl border border-gray-200">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  {editingStudent ? <AppIcons.Edit size={20} className="text-white" /> : <AppIcons.Add size={20} className="text-white" />}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter student's full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Course *</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Year *</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 transition-all shadow-lg font-medium"
                  >
                    {loading ? (editingStudent ? 'Updating...' : 'Adding...') : (editingStudent ? 'Update Student' : 'Add Student')}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 py-3 sm:py-4 px-4 rounded-xl hover:from-gray-400 hover:to-gray-500 transition-all font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced CSV Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto shadow-2xl border border-gray-200">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="p-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg">
                  <AppIcons.Upload size={20} className="text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Import Students from CSV</h2>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Required CSV format:
                </p>
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-mono border-2 border-gray-300">
                  name,email,course,year,phone<br/>
                  John Doe,john@example.com,Computer Science,1st Year,9876543210<br/>
                  Jane Smith,jane@example.com,Information Technology,2nd Year,9876543211
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">CSV Data</label>
                <textarea
                  placeholder="Paste your CSV data here..."
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-48 font-mono text-sm transition-all"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleCSVImport}
                  disabled={loading || !csvData.trim()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 sm:py-4 px-4 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-400 transition-all shadow-lg font-medium"
                >
                  {loading ? 'Importing...' : 'Import Students'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false)
                    setCsvData('')
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 py-3 sm:py-4 px-4 rounded-xl hover:from-gray-400 hover:to-gray-500 transition-all font-medium"
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
