// src/app/professors/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import { AppIcons } from '@/components/icons/AppIcons'

interface Professor {
  id: string
  name: string
  email: string
  college: string
  department: string
  designation: string
  phone?: string
  expertise?: string
  createdAt: string
}

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>([])
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [designationFilter, setDesignationFilter] = useState('')
  const [collegeFilter, setCollegeFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null)
  const [loading, setLoading] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    department: '',
    designation: 'Professor',
    phone: '',
    expertise: ''
  })

  // CSV import state
  const [csvData, setCsvData] = useState('')

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics & Communication',
    'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
    'Chemical Engineering', 'Aerospace Engineering', 'Biotechnology',
    'Mathematics', 'Physics', 'Chemistry', 'English Literature', 'Economics',
    'Business Administration', 'Management Studies', 'Commerce', 'Psychology',
    'Sociology', 'Political Science', 'History', 'Philosophy', 'Fine Arts'
  ]

  const designations = [
    'Professor', 'Associate Professor', 'Assistant Professor', 'Dr.', 'Dean', 
    'Head of Department', 'Principal', 'Director', 'Lecturer', 'Senior Lecturer',
    'Vice Chancellor', 'Pro Vice Chancellor', 'Registrar', 'Controller of Examinations',
    'Emeritus Professor', 'Visiting Professor', 'Research Professor'
  ]

  const colleges = [
    'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
    'BITS Pilani', 'NIT Trichy', 'NIT Warangal', 'IIIT Hyderabad', 'DTU Delhi',
    'VIT Vellore', 'Manipal University', 'SRM University', 'Amity University',
    'Delhi University', 'Jawaharlal Nehru University', 'Jamia Millia Islamia',
    'Anna University', 'Pune University', 'Mumbai University', 'Bangalore University'
  ]

  useEffect(() => {
    fetchProfessors()
  }, [])

  useEffect(() => {
    filterProfessors()
  }, [professors, searchTerm, departmentFilter, designationFilter, collegeFilter])

  const fetchProfessors = async () => {
    try {
      const response = await fetch('/api/professors')
      const data = await response.json()
      setProfessors(data)
    } catch (error) {
      console.error('Error fetching professors:', error)
    }
  }

  const filterProfessors = () => {
    let filtered = professors

    if (searchTerm) {
      filtered = filtered.filter(professor =>
        professor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professor.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professor.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (departmentFilter) {
      filtered = filtered.filter(professor => professor.department === departmentFilter)
    }

    if (designationFilter) {
      filtered = filtered.filter(professor => professor.designation === designationFilter)
    }

    if (collegeFilter) {
      filtered = filtered.filter(professor => 
        professor.college.toLowerCase().includes(collegeFilter.toLowerCase())
      )
    }

    setFilteredProfessors(filtered)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      college: '',
      department: '',
      designation: 'Professor',
      phone: '',
      expertise: ''
    })
    setEditingProfessor(null)
    setShowForm(false)
  }

  // CRUD Operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingProfessor 
        ? `/api/professors?id=${editingProfessor.id}`
        : '/api/professors'
      
      const method = editingProfessor ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ Professor ${editingProfessor ? 'updated' : 'added'} successfully!`)
        fetchProfessors()
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

  const handleEdit = (professor: Professor) => {
    setFormData({
      name: professor.name,
      email: professor.email,
      college: professor.college,
      department: professor.department,
      designation: professor.designation,
      phone: professor.phone || '',
      expertise: professor.expertise || ''
    })
    setEditingProfessor(professor)
    setShowForm(true)
  }

  const handleDelete = async (professor: Professor) => {
    if (!confirm(`Are you sure you want to delete ${professor.designation} ${professor.name} from ${professor.college}?\nThis action cannot be undone.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/professors?id=${professor.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ ${result.message}`)
        fetchProfessors()
        setSelectedProfessors(prev => prev.filter(id => id !== professor.id))
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
    if (selectedProfessors.length === 0) {
      alert('Please select professors to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedProfessors.length} selected professors?\nThis action cannot be undone.`)) {
      return
    }

    setLoading(true)
    let successCount = 0
    let errorCount = 0

    for (const professorId of selectedProfessors) {
      try {
        const response = await fetch(`/api/professors?id=${professorId}`, {
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
    fetchProfessors()
    setSelectedProfessors([])
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
      const requiredHeaders = ['name', 'email', 'college', 'department']
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
        const professorData: { [key: string]: string } = {
          designation: 'Professor' // Default designation
        }
        
        headers.forEach((header, index) => {
          professorData[header] = values[index] || ''
        })

        // Skip empty rows
        if (!professorData.name || !professorData.email) {
          continue
        }

        try {
          const response = await fetch('/api/professors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(professorData)
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
        fetchProfessors()
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
    if (professors.length === 0) {
      alert('No professors to export')
      return
    }

    const csvContent = [
      ['name', 'email', 'college', 'department', 'designation', 'phone', 'expertise', 'createdAt'].join(','),
      ...professors.map(professor => [
        professor.name,
        professor.email,
        professor.college,
        professor.department,
        professor.designation,
        professor.phone || '',
        professor.expertise || '',
        new Date(professor.createdAt).toISOString().split('T')[0]
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `professors-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Selection functions
  const selectAllVisible = () => {
    if (selectedProfessors.length === filteredProfessors.length) {
      setSelectedProfessors([])
    } else {
      setSelectedProfessors(filteredProfessors.map(p => p.id))
    }
  }

  const selectAll = () => {
    setSelectedProfessors(selectedProfessors.length === professors.length ? [] : professors.map(p => p.id))
  }

  const getDesignationColor = (designation: string) => {
    const colors: { [key: string]: string } = {
      'Professor': 'bg-blue-100 text-blue-800',
      'Associate Professor': 'bg-green-100 text-green-800',
      'Assistant Professor': 'bg-yellow-100 text-yellow-800',
      'Dr.': 'bg-purple-100 text-purple-800',
      'Dean': 'bg-red-100 text-red-800',
      'Head of Department': 'bg-indigo-100 text-indigo-800',
      'Principal': 'bg-pink-100 text-pink-800',
      'Director': 'bg-gray-100 text-gray-800'
    }
    return colors[designation] || 'bg-gray-100 text-gray-800'
  }

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 text-gray-600">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                <AppIcons.Professors size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Professors Management</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your professor database</p>
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
                <AppIcons.Professors size={18} />
                <span className="text-sm sm:text-base">Add Professor</span>
              </button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <AppIcons.Filter size={20} className="text-purple-600" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Filters & Search</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative">
                <AppIcons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, college..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Designations</option>
                {designations.map(designation => (
                  <option key={designation} value={designation}>{designation}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Filter by college..."
                value={collegeFilter}
                onChange={(e) => setCollegeFilter(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />

              <button
                onClick={() => {
                  setSearchTerm('')
                  setDepartmentFilter('')
                  setDesignationFilter('')
                  setCollegeFilter('')
                }}
                className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:from-gray-300 hover:to-gray-400 flex items-center justify-center gap-2 transition-all font-medium"
              >
                <AppIcons.Close size={16} />
                <span className="hidden lg:inline">Clear Filters</span>
                <span className="lg:hidden">Clear</span>
              </button>
            </div>

            {/* Enhanced Bulk Actions */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-purple-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <button
                    onClick={selectAll}
                    className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-all font-medium"
                  >
                    {selectedProfessors.length === professors.length ? <AppIcons.Close size={14} /> : <AppIcons.Check size={14} />}
                    <span>{selectedProfessors.length === professors.length ? 'Deselect All' : 'Select All'}</span>
                  </button>
                  
                  <button
                    onClick={selectAllVisible}
                    className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-all font-medium"
                  >
                    {selectedProfessors.length === filteredProfessors.length ? <AppIcons.Close size={14} /> : <AppIcons.Check size={14} />}
                    <span>{selectedProfessors.length === filteredProfessors.length ? 'Deselect Visible' : 'Select Visible'}</span>
                  </button>
                  
                  {selectedProfessors.length > 0 && (
                    <>
                      <button
                        onClick={handleBulkDelete}
                        disabled={loading}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 transition-all font-medium shadow-lg flex items-center gap-1 sm:gap-2"
                      >
                        <AppIcons.Delete size={14} />
                        <span className="hidden sm:inline">Delete Selected ({selectedProfessors.length})</span>
                        <span className="sm:hidden">Delete ({selectedProfessors.length})</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const selectedData = professors.filter(p => selectedProfessors.includes(p.id))
                          const csvContent = [
                            ['name', 'email', 'college', 'department', 'designation', 'phone', 'expertise'].join(','),
                            ...selectedData.map(professor => [
                              professor.name,
                              professor.email,
                              professor.college,
                              professor.department,
                              professor.designation,
                              professor.phone || '',
                              professor.expertise || ''
                            ].join(','))
                          ].join('\n')

                          const blob = new Blob([csvContent], { type: 'text/csv' })
                          const url = window.URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `selected-professors-${new Date().toISOString().split('T')[0]}.csv`
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
                
                <div className="bg-white rounded-lg px-3 sm:px-4 py-2 shadow-inner border border-purple-200">
                  <p className="text-xs sm:text-sm text-gray-700 font-medium">
                    <span className="text-purple-600 font-bold">Total:</span> {professors.length} | 
                    <span className="text-blue-600 font-bold"> Filtered:</span> {filteredProfessors.length} | 
                    <span className="text-indigo-600 font-bold"> Selected:</span> {selectedProfessors.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Professors Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedProfessors.length === filteredProfessors.length && filteredProfessors.length > 0}
                        onChange={selectAllVisible}
                        className="rounded border-gray-300 h-4 w-4 sm:h-5 sm:w-5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Professor Details</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Institution</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Department & Expertise</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Added</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfessors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                        <div className="text-gray-500">
                          <div className="flex justify-center mb-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                              <AppIcons.Professors size={48} className="text-gray-400" />
                            </div>
                          </div>
                          <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No professors found</p>
                          <p className="text-sm sm:text-base text-gray-500 mb-6">
                            {professors.length === 0 ? 'Start by adding your first professor' : 'Try adjusting your search filters'}
                          </p>
                          {professors.length === 0 && (
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                              <button
                                onClick={() => setShowForm(true)}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all font-medium flex items-center gap-2"
                              >
                                <AppIcons.Add size={16} />
                                <span>Add First Professor</span>
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
                    filteredProfessors.map((professor) => (
                      <tr key={professor.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedProfessors.includes(professor.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProfessors([...selectedProfessors, professor.id])
                              } else {
                                setSelectedProfessors(selectedProfessors.filter(id => id !== professor.id))
                              }
                            }}
                            className="rounded border-gray-300 h-4 w-4 sm:h-5 sm:w-5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                              <AppIcons.Professors size={16} className="text-purple-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDesignationColor(professor.designation)}`}>
                                  {professor.designation}
                                </span>
                              </div>
                              <div className="text-sm sm:text-base font-semibold text-gray-900">{professor.name}</div>
                              <div className="text-xs sm:text-sm text-gray-600">{professor.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-sm sm:text-base font-medium text-gray-900">{professor.college}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-sm sm:text-base font-medium text-gray-900">{professor.department}</div>
                          {professor.expertise && (
                            <div className="text-xs sm:text-sm text-gray-600 mt-1 bg-yellow-100 rounded-full px-2 py-1 inline-block">
                              <span className="mr-1">💡</span>{professor.expertise}
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                            professor.phone 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {professor.phone || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg ">
                          {new Date(professor.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleEdit(professor)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all text-xs sm:text-sm font-medium"
                            >
                              <AppIcons.Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(professor)}
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

        {/* Enhanced Add/Edit Professor Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-lg w-full mx-4 max-h-screen overflow-y-auto shadow-2xl border border-gray-200">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
                  {editingProfessor ? <AppIcons.Edit size={20} className="text-white" /> : <AppIcons.Add size={20} className="text-white" />}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingProfessor ? 'Edit Professor' : 'Add New Professor'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter professor's full name"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">College/University *</label>
                    <input
                      type="text"
                      placeholder="Enter college name"
                      value={formData.college}
                      onChange={(e) => setFormData({...formData, college: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      list="colleges"
                      required
                    />
                    <datalist id="colleges">
                      {colleges.map(college => (
                        <option key={college} value={college} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select Department *</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                    <select
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {designations.map(designation => (
                        <option key={designation} value={designation}>{designation}</option>
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
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expertise/Research Areas (Optional)</label>
                  <textarea
                    placeholder="Enter expertise or research areas"
                    value={formData.expertise}
                    onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={3}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 transition-all shadow-lg font-medium"
                  >
                    {loading ? (editingProfessor ? 'Updating...' : 'Adding...') : (editingProfessor ? 'Update Professor' : 'Add Professor')}
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
                <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
                  <AppIcons.Upload size={20} className="text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Import Professors from CSV</h2>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Required CSV format:
                </p>
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-mono border-2 border-gray-300">
                  name,email,college,department,designation,phone,expertise<br/>
                  Dr. John Smith,john@iitdelhi.ac.in,IIT Delhi,Computer Science,Professor,9876543210,Machine Learning<br/>
                  Prof. Jane Doe,jane@nitdelhi.ac.in,NIT Delhi,Electronics,Associate Professor,9876543211,Signal Processing
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">CSV Data</label>
                <textarea
                  placeholder="Paste your CSV data here..."
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-48 font-mono text-sm transition-all"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleCSVImport}
                  disabled={loading || !csvData.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 transition-all shadow-lg font-medium"
                >
                  {loading ? 'Importing...' : 'Import Professors'}
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
