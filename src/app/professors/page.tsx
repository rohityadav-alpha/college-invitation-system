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
      <div className="min-h-screen bg-gray-50 text-gray-700">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Professors Management</h1>
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
                <AppIcons.Professors className="h-5 w-5 inline" />
                Add Professor
              </button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by name, email, college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={() => {
                  setSearchTerm('')
                  setDepartmentFilter('')
                  setDesignationFilter('')
                  setCollegeFilter('')
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
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
                  {selectedProfessors.length === professors.length ? <AppIcons.Close className="h-5 w-5 inline" /> : <AppIcons.Check className="h-5 w-5 inline" />}
                  {selectedProfessors.length === professors.length ? ' Deselect All' : ' Select All'}
                </button>
                
                <button
                  onClick={selectAllVisible}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedProfessors.length === filteredProfessors.length ? <AppIcons.Close className="h-5 w-5 inline" /> : <AppIcons.Check className="h-5 w-5 inline" />}
                  {selectedProfessors.length === filteredProfessors.length ? ' Deselect Visible' : ' Select Visible'}
                </button>
                
                {selectedProfessors.length > 0 && (
                  <>
                    <button
                      onClick={handleBulkDelete}
                      disabled={loading}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                    >
                      <AppIcons.Delete className="h-5 w-5 inline" /> Delete Selected ({selectedProfessors.length})
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
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                      <AppIcons.Download className="h-5 w-5 inline" /> Export Selected
                    </button>
                  </>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Total:</strong> {professors.length} | <strong>Filtered:</strong> {filteredProfessors.length} | <strong>Selected:</strong> {selectedProfessors.length}
              </p>
            </div>
          </div>

          {/* Professors Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedProfessors.length === filteredProfessors.length && filteredProfessors.length > 0}
                        onChange={selectAllVisible}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professor Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department & Expertise</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfessors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <div className="text-4xl mb-4"><AppIcons.Professors className="h-5 w-5 inline" /></div>
                          <p className="text-lg font-medium">No professors found</p>
                          <p className="text-sm">
                            {professors.length === 0 ? 'Start by adding your first professor' : 'Try adjusting your search filters'}
                          </p>
                          {professors.length === 0 && (
                            <div className="mt-4 flex justify-center gap-3">
                              <button
                                onClick={() => setShowForm(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                              >
                                <AppIcons.Add className="h-5 w-5 inline" />
                                Add First Professor
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
                    filteredProfessors.map((professor) => (
                      <tr key={professor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
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
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <span><AppIcons.Professors className="h-5 w-5 inline" /></span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDesignationColor(professor.designation)}`}>
                                {professor.designation}
                              </span>
                              {professor.name}
                            </div>
                            <div className="text-sm text-gray-500">{professor.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{professor.college}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{professor.department}</div>
                          {professor.expertise && (
                            <div className="text-sm text-gray-500 italic">
                              💡 {professor.expertise}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {professor.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(professor.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(professor)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <AppIcons.Edit className="h-5 w-5 inline" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(professor)}
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

        {/* Add/Edit Professor Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">
                {editingProfessor ? <AppIcons.Edit className="h-5 w-5 inline" /> : <AppIcons.Add className="h-5 w-5 inline" />}
                {editingProfessor ? 'Edit Professor' : 'Add New Professor'}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="College/University *"
                    value={formData.college}
                    onChange={(e) => setFormData({...formData, college: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    list="colleges"
                    required
                  />
                  <datalist id="colleges">
                    {colleges.map(college => (
                      <option key={college} value={college} />
                    ))}
                  </datalist>

                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department *</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {designations.map(designation => (
                      <option key={designation} value={designation}>{designation}</option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <textarea
                  placeholder="Expertise/Research Areas (Optional)"
                  value={formData.expertise}
                  onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {loading ? (editingProfessor ? 'Updating...' : 'Adding...') : (editingProfessor ? 'Update Professor' : 'Add Professor')}
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
              <h2 className="text-xl font-bold mb-6"><AppIcons.Upload className="h-5 w-5 inline" /> Import Professors from CSV</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Required CSV format:</strong>
                </p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  name,email,college,department,designation,phone,expertise<br/>
                  Dr. John Smith,john@iitdelhi.ac.in,IIT Delhi,Computer Science,Professor,9876543210,Machine Learning<br/>
                  Prof. Jane Doe,jane@nitdelhi.ac.in,NIT Delhi,Electronics,Associate Professor,9876543211,Signal Processing
                </div>
              </div>

              <textarea
                placeholder="Paste your CSV data here..."
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-48 font-mono text-sm"
                required
              />

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCSVImport}
                  disabled={loading || !csvData.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {loading ? 'Importing...' : 'Import Professors'}
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
