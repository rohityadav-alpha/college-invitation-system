// src/app/guests/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import { AppIcons } from '@/components/icons/AppIcons'

interface Guest {
  id: string
  name: string
  email: string
  organization: string
  designation: string
  category: string
  phone?: string
  createdAt: string
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([])
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [organizationFilter, setOrganizationFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    designation: '',
    category: 'guest',
    phone: ''
  })

  // CSV import state
  const [csvData, setCsvData] = useState('')

  const categories = ['guest', 'vip', 'alumni', 'industry', 'media', 'sponsor', 'speaker', 'judge', 'chief guest']

  const organizations = [
    'Microsoft', 'Google', 'Amazon', 'IBM', 'TCS', 'Infosys', 'Wipro', 'Tech Mahindra',
    'Accenture', 'Deloitte', 'Government', 'Startup', 'NGO', 'Media House', 'University'
  ]

  useEffect(() => {
    fetchGuests()
  }, [])

  useEffect(() => {
    filterGuests()
  }, [guests, searchTerm, categoryFilter, organizationFilter])

  const fetchGuests = async () => {
    try {
      const response = await fetch('/api/guests')
      const data = await response.json()
      setGuests(data)
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }

  const filterGuests = () => {
    let filtered = guests

    if (searchTerm) {
      filtered = filtered.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.designation.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (categoryFilter) {
      filtered = filtered.filter(guest => guest.category === categoryFilter)
    }

    if (organizationFilter) {
      filtered = filtered.filter(guest => 
        guest.organization.toLowerCase().includes(organizationFilter.toLowerCase())
      )
    }

    setFilteredGuests(filtered)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      organization: '',
      designation: '',
      category: 'guest',
      phone: ''
    })
    setEditingGuest(null)
    setShowForm(false)
  }

  // CRUD Operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingGuest 
        ? `/api/guests?id=${editingGuest.id}`
        : '/api/guests'
      
      const method = editingGuest ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ Guest ${editingGuest ? 'updated' : 'added'} successfully!`)
        fetchGuests()
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

  const handleEdit = (guest: Guest) => {
    setFormData({
      name: guest.name,
      email: guest.email,
      organization: guest.organization,
      designation: guest.designation,
      category: guest.category,
      phone: guest.phone || ''
    })
    setEditingGuest(guest)
    setShowForm(true)
  }

  const handleDelete = async (guest: Guest) => {
    if (!confirm(`Are you sure you want to delete ${guest.name} from ${guest.organization}?\nThis action cannot be undone.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/guests?id=${guest.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ ${result.message}`)
        fetchGuests()
        setSelectedGuests(prev => prev.filter(id => id !== guest.id))
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
    if (selectedGuests.length === 0) {
      alert('Please select guests to delete')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedGuests.length} selected guests?\nThis action cannot be undone.`)) {
      return
    }

    setLoading(true)
    let successCount = 0
    let errorCount = 0

    for (const guestId of selectedGuests) {
      try {
        const response = await fetch(`/api/guests?id=${guestId}`, {
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
    fetchGuests()
    setSelectedGuests([])
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
      const requiredHeaders = ['name', 'email', 'organization', 'designation']
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
        const guestData: { [key: string]: string } = {
          category: 'guest' // Default category
        }
        
        headers.forEach((header, index) => {
          guestData[header] = values[index] || ''
        })

        // Skip empty rows
        if (!guestData.name || !guestData.email) {
          continue
        }

        try {
          const response = await fetch('/api/guests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestData)
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
        fetchGuests()
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
    if (guests.length === 0) {
      alert('No guests to export')
      return
    }

    const csvContent = [
      ['name', 'email', 'organization', 'designation', 'category', 'phone', 'createdAt'].join(','),
      ...guests.map(guest => [
        guest.name,
        guest.email,
        guest.organization,
        guest.designation,
        guest.category,
        guest.phone || '',
        new Date(guest.createdAt).toISOString().split('T')[0]
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guests-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Selection functions
  const selectAllVisible = () => {
    if (selectedGuests.length === filteredGuests.length) {
      setSelectedGuests([])
    } else {
      setSelectedGuests(filteredGuests.map(g => g.id))
    }
  }

  const selectAll = () => {
    setSelectedGuests(selectedGuests.length === guests.length ? [] : guests.map(g => g.id))
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'guest': 'bg-blue-100 text-blue-800',
      'vip': 'bg-purple-100 text-purple-800',
      'alumni': 'bg-green-100 text-green-800',
      'industry': 'bg-orange-100 text-orange-800',
      'media': 'bg-red-100 text-red-800',
      'sponsor': 'bg-yellow-100 text-yellow-800',
      'speaker': 'bg-indigo-100 text-indigo-800',
      'judge': 'bg-pink-100 text-pink-800',
      'chief guest': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <AdminProtection>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 text-gray-600">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                <AppIcons.Guests size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Guests Management</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your guest database</p>
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
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-2 shadow-lg transition-all font-medium"
              >
                <AppIcons.Add size={18} />
                <span className="text-sm sm:text-base">Add Guest</span>
              </button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <AppIcons.Filter size={20} className="text-green-600" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Filters & Search</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="relative">
                <AppIcons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Filter by organization..."
                value={organizationFilter}
                onChange={(e) => setOrganizationFilter(e.target.value)}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />

              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('')
                  setOrganizationFilter('')
                }}
                className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:from-gray-300 hover:to-gray-400 flex items-center justify-center gap-2 transition-all font-medium"
              >
                <AppIcons.Close size={16} />
                <span className="hidden sm:inline">Clear Filters</span>
                <span className="sm:hidden">Clear</span>
              </button>
            </div>

            {/* Enhanced Bulk Actions */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border-2 border-green-200">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <button
                    onClick={selectAll}
                    className="text-xs sm:text-sm text-green-600 hover:text-green-800 flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-green-200 hover:bg-green-50 transition-all font-medium"
                  >
                    {selectedGuests.length === guests.length ? <AppIcons.Close size={14} className="text-red-500" /> : <AppIcons.Check size={14} />}
                    <span>{selectedGuests.length === guests.length ? 'Deselect All' : 'Select All'}</span>
                  </button>
                  
                  <button
                    onClick={selectAllVisible}
                    className="text-xs sm:text-sm text-green-600 hover:text-green-800 flex items-center gap-1 sm:gap-2 bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-green-200 hover:bg-green-50 transition-all font-medium"
                  >
                    {selectedGuests.length === filteredGuests.length ? <AppIcons.Close size={14} className="text-red-500" /> : <AppIcons.Check size={14} />}
                    <span>{selectedGuests.length === filteredGuests.length ? 'Deselect Visible' : 'Select Visible'}</span>
                  </button>
                  
                  {selectedGuests.length > 0 && (
                    <>
                      <button
                        onClick={handleBulkDelete}
                        disabled={loading}
                        className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 transition-all font-medium shadow-lg flex items-center gap-1 sm:gap-2"
                      >
                        <AppIcons.Delete size={14} />
                        <span className="hidden sm:inline">Delete Selected ({selectedGuests.length})</span>
                        <span className="sm:hidden">Delete ({selectedGuests.length})</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const selectedData = guests.filter(g => selectedGuests.includes(g.id))
                          const csvContent = [
                            ['name', 'email', 'organization', 'designation', 'category', 'phone'].join(','),
                            ...selectedData.map(guest => [
                              guest.name,
                              guest.email,
                              guest.organization,
                              guest.designation,
                              guest.category,
                              guest.phone || ''
                            ].join(','))
                          ].join('\n')

                          const blob = new Blob([csvContent], { type: 'text/csv' })
                          const url = window.URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `selected-guests-${new Date().toISOString().split('T')[0]}.csv`
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
                
                <div className="bg-white rounded-lg px-3 sm:px-4 py-2 shadow-inner border border-green-200">
                  <p className="text-xs sm:text-sm text-gray-700 font-medium">
                    <span className="text-green-600 font-bold">Total:</span> {guests.length} | 
                    <span className="text-blue-600 font-bold"> Filtered:</span> {filteredGuests.length} | 
                    <span className="text-purple-600 font-bold"> Selected:</span> {selectedGuests.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Guests Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
                        onChange={selectAllVisible}
                        className="rounded border-gray-300 h-4 w-4 sm:h-5 sm:w-5 text-green-600 focus:ring-2 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Guest Details</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Organization</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Added</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                        <div className="text-gray-500">
                          <div className="flex justify-center mb-4">
                            <div className="p-4 bg-gray-100 rounded-full">
                              <AppIcons.Guests size={48} className="text-gray-400" />
                            </div>
                          </div>
                          <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No guests found</p>
                          <p className="text-sm sm:text-base text-gray-500 mb-6">
                            {guests.length === 0 ? 'Start by adding your first guest' : 'Try adjusting your search filters'}
                          </p>
                          {guests.length === 0 && (
                            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                              <button
                                onClick={() => setShowForm(true)}
                                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-green-700 hover:to-green-800 shadow-lg transition-all font-medium"
                              >
                                Add First Guest
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
                    filteredGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedGuests.includes(guest.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGuests([...selectedGuests, guest.id])
                              } else {
                                setSelectedGuests(selectedGuests.filter(id => id !== guest.id))
                              }
                            }}
                            className="rounded border-gray-300 h-4 w-4 sm:h-5 sm:w-5 text-green-600 focus:ring-2 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                              <AppIcons.User size={16} className="text-green-600" />
                            </div>
                            <div>
                              <div className="text-sm sm:text-base font-semibold text-gray-900">{guest.name}</div>
                              <div className="text-xs sm:text-sm text-gray-600">{guest.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-sm sm:text-base font-medium text-gray-900">{guest.organization}</div>
                          <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 rounded-full px-2 py-1 inline-block">{guest.designation}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(guest.category)}`}>
                            {guest.category}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                            guest.phone 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {guest.phone || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg">
                          {new Date(guest.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleEdit(guest)}
                              className="text-green-600 hover:text-green-800 flex items-center gap-1 hover:bg-green-50 px-2 py-1 rounded-lg transition-all text-xs sm:text-sm font-medium"
                            >
                              <AppIcons.Edit size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(guest)}
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

        {/* Enhanced Add/Edit Guest Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 max-h-screen overflow-y-auto shadow-2xl border border-gray-200">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                  {editingGuest ? <AppIcons.Edit size={20} className="text-white" /> : <AppIcons.Add size={20} className="text-white" />}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingGuest ? 'Edit Guest' : 'Add New Guest'}
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter guest's full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization/Company *</label>
                  <input
                    type="text"
                    placeholder="Enter organization name"
                    value={formData.organization}
                    onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    list="organizations"
                    required
                  />
                  <datalist id="organizations">
                    {organizations.map(org => (
                      <option key={org} value={org} />
                    ))}
                  </datalist>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation/Title *</label>
                  <input
                    type="text"
                    placeholder="Enter designation or job title"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
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
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 sm:py-4 px-4 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-400 transition-all shadow-lg font-medium"
                  >
                    {loading ? (editingGuest ? 'Updating...' : 'Adding...') : (editingGuest ? 'Update Guest' : 'Add Guest')}
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
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Import Guests from CSV</h2>
              </div>
              
              <div className="mb-4 sm:mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Required CSV format:
                </p>
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-mono border-2 border-gray-300">
                  name,email,organization,designation,category,phone<br/>
                  John Doe,john@microsoft.com,Microsoft,Software Engineer,industry,9876543210<br/>
                  Jane Smith,jane@startup.com,TechStart,CEO,speaker,9876543211
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
                  {loading ? 'Importing...' : 'Import Guests'}
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
