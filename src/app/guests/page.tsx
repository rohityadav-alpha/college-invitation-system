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
      <div className="min-h-screen bg-gray-50 text-gray-700">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Guests Management</h1>
            <div className="flex gap-3">
              {/* CSV Import/Export Buttons */}
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <AppIcons.Upload className="h-5 w-5" />
                Import CSV
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <AppIcons.Download className="h-5 w-5" />
                Export CSV
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <AppIcons.Add className="h-5 w-5" />
                Add Guest
              </button>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by name, email, organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('')
                  setOrganizationFilter('')
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
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  {selectedGuests.length === guests.length ? <AppIcons.Close className="h-5 w-5 inline text-red-500" /> : <AppIcons.Check className="h-5 w-5 inline" />}
                  {selectedGuests.length === guests.length ? ' Deselect All' : ' Select All'}
                </button>
                
                <button
                  onClick={selectAllVisible}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  {selectedGuests.length === filteredGuests.length ? <AppIcons.Close className="h-5 w-5 inline text-red-500" /> : <AppIcons.Check className="h-5 w-5 inline" />}
                  {selectedGuests.length === filteredGuests.length ? ' Deselect Visible' : ' Select Visible'}
                </button>
                
                {selectedGuests.length > 0 && (
                  <>
                    <button
                      onClick={handleBulkDelete}
                      disabled={loading}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
                    >
                      <AppIcons.Delete className="h-5 w-5" /> Delete Selected ({selectedGuests.length})
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
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                      <AppIcons.Download className="h-5 w-5" /> Export Selected
                    </button>
                  </>
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                <strong>Total:</strong> {guests.length} | <strong>Filtered:</strong> {filteredGuests.length} | <strong>Selected:</strong> {selectedGuests.length}
              </p>
            </div>
          </div>

          {/* Guests Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedGuests.length === filteredGuests.length && filteredGuests.length > 0}
                        onChange={selectAllVisible}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <div className="text-4xl mb-4"><AppIcons.Guests className="h-5 w-5 inline" /></div>
                          <p className="text-lg font-medium">No guests found</p>
                          <p className="text-sm">
                            {guests.length === 0 ? 'Start by adding your first guest' : 'Try adjusting your search filters'}
                          </p>
                          {guests.length === 0 && (
                            <div className="mt-4 flex justify-center gap-3">
                              <button
                                onClick={() => setShowForm(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                              >
                                Add First Guest
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
                    filteredGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
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
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <AppIcons.User className="h-5 w-5 inline" />
                              {guest.name}
                            </div>
                            <div className="text-sm text-gray-500">{guest.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{guest.organization}</div>
                          <div className="text-sm text-gray-500">{guest.designation}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(guest.category)}`}>
                            {guest.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guest.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(guest.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(guest)}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            >
                              <AppIcons.Edit className="h-5 w-5 inline" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(guest)}
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

        {/* Add/Edit Guest Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-6">
                {editingGuest ? <AppIcons.Edit className="h-5 w-5 inline" /> : <AppIcons.Add className="h-5 w-5 inline" />} {editingGuest ? 'Edit Guest' : 'Add New Guest'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                
                <input
                  type="text"
                  placeholder="Organization/Company *"
                  value={formData.organization}
                  onChange={(e) => setFormData({...formData, organization: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  list="organizations"
                  required
                />
                <datalist id="organizations">
                  {organizations.map(org => (
                    <option key={org} value={org} />
                  ))}
                </datalist>
                
                <input
                  type="text"
                  placeholder="Designation/Title *"
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                
                <input
                  type="tel"
                  placeholder="Phone Number (Optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400"
                  >
                    {loading ? (editingGuest ? 'Updating...' : 'Adding...') : (editingGuest ? 'Update Guest' : 'Add Guest')}
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
              <h2 className="text-xl font-bold mb-6"><AppIcons.Upload className="h-5 w-5 inline" /> Import Guests from CSV</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Required CSV format:</strong>
                </p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono">
                  name,email,organization,designation,category,phone<br/>
                  John Doe,john@microsoft.com,Microsoft,Software Engineer,industry,9876543210<br/>
                  Jane Smith,jane@startup.com,TechStart,CEO,speaker,9876543211
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
                  {loading ? 'Importing...' : 'Import Guests'}
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
