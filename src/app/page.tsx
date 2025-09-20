'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AppIcons } from '@/components/icons/AppIcons'

export default function HomePage() {
  const { isAdmin, login, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'student' | 'guest' | 'professor'>('student')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    course: '',
    year: '',
    phone: ''
  })

  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    organization: '',
    designation: '',
    phone: '',
    category: 'guest'
  })

  const [professorForm, setProfessorForm] = useState({
    name: '',
    email: '',
    college: '',
    department: '',
    designation: 'Professor',
    phone: '',
    expertise: ''
  })

  // Admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(adminPassword)
    
    if (result.success) {
      alert('✅ Admin login successful!')
      setShowAdminLogin(false)
      setAdminPassword('')
      // Redirect to dashboard
      window.location.href = '/dashboard'
    } else {
      alert(`❌ ${result.error}`)
    }
    
    setLoading(false)
  }

  // Student registration
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentForm)
      })

      if (response.ok) {
        alert('✅ Student registration successful! You will receive invitations on your email.')
        setStudentForm({ name: '', email: '', course: '', year: '', phone: '' })
      } else {
        const result = await response.json()
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Guest registration
  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestForm)
      })

      if (response.ok) {
        alert('✅ Guest registration successful! You will receive invitations on your email.')
        setGuestForm({ name: '', email: '', organization: '', designation: '', phone: '', category: 'guest' })
      } else {
        const result = await response.json()
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Professor registration
  const handleProfessorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/professors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(professorForm)
      })

      if (response.ok) {
        alert('✅ Professor registration successful! You will receive invitations on your email.')
        setProfessorForm({ 
          name: '', 
          email: '', 
          college: '', 
          department: '', 
          designation: 'Professor', 
          phone: '', 
          expertise: '' 
        })
      } else {
        const result = await response.json()
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const courses = [
    'Computer Science', 'Information Technology', 'Electronics & Communication',
    'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
    'Business Administration', 'Commerce', 'Arts', 'Science'
  ]

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year']

  const categories = ['guest', 'vip', 'alumni', 'industry', 'media', 'sponsor', 'speaker']

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics & Communication',
    'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
    'Mathematics', 'Physics', 'Chemistry', 'English', 'Business Administration'
  ]

  const designations = [
    'Professor', 'Associate Professor', 'Assistant Professor', 'Dr.', 'Dean', 
    'Head of Department', 'Principal', 'Director', 'Lecturer', 'Senior Lecturer'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-700">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <AppIcons.Rocket size={48} className="text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">
                College Invitation System
              </span>
          
            </div>
            <div className="flex gap-3">
              {!isAdmin ? (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 flex items-center gap-2"
                >
                  <AppIcons.Lock size={18} />
                  Admin Login
                </button>
              ) : (
                <div className="flex gap-2">
                  <a
                    href="/dashboard"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <AppIcons.Dashboard size={18} />
                    Dashboard
                  </a>
                  <button
                    onClick={logout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <AppIcons.Logout size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Registration Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex bg-gray-50">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'student' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AppIcons.Students size={20} />
                Student Registration
              </div>
            </button>
            <button
              onClick={() => setActiveTab('guest')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'guest' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AppIcons.Guests size={20} />
                Guest Registration
              </div>
            </button>
            <button
              onClick={() => setActiveTab('professor')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'professor' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AppIcons.Professors size={20} />
                Professor Registration
              </div>
            </button>
          </div>

          {/* Registration Forms */}
          <div className="p-8">
            {/* Student Form */}
            {activeTab === 'student' && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <AppIcons.Students size={38} />
                  Student Registration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <select
                    value={studentForm.course}
                    onChange={(e) => setStudentForm({...studentForm, course: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Course *</option>
                    {courses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                  <select
                    value={studentForm.year}
                    onChange={(e) => setStudentForm({...studentForm, year: e.target.value})}
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
                    placeholder="Phone Number"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  <AppIcons.Check size={18} />
                  {loading ? 'Registering...' : 'Register as Student'}
                </button>
              </form>
            )}

            {/* Guest Form */}
            {activeTab === 'guest' && (
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <AppIcons.Guests size={38} />
                  Guest Registration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={guestForm.name}
                    onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Organization/Company *"
                    value={guestForm.organization}
                    onChange={(e) => setGuestForm({...guestForm, organization: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Your Designation *"
                    value={guestForm.designation}
                    onChange={(e) => setGuestForm({...guestForm, designation: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <select
                    value={guestForm.category}
                    onChange={(e) => setGuestForm({...guestForm, category: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  <AppIcons.Check size={18} />
                  {loading ? 'Registering...' : 'Register as Guest'}
                </button>
              </form>
            )}

            {/* Professor Form */}
            {activeTab === 'professor' && (
              <form onSubmit={handleProfessorSubmit} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <AppIcons.Professors size={38} />
                  Professor Registration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={professorForm.name}
                    onChange={(e) => setProfessorForm({...professorForm, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={professorForm.email}
                    onChange={(e) => setProfessorForm({...professorForm, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="College/University Name *"
                    value={professorForm.college}
                    onChange={(e) => setProfessorForm({...professorForm, college: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <select
                    value={professorForm.department}
                    onChange={(e) => setProfessorForm({...professorForm, department: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Select Department *</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <select
                    value={professorForm.designation}
                    onChange={(e) => setProfessorForm({...professorForm, designation: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {designations.map(designation => (
                      <option key={designation} value={designation}>{designation}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={professorForm.phone}
                    onChange={(e) => setProfessorForm({...professorForm, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Expertise/Subject Area"
                    value={professorForm.expertise}
                    onChange={(e) => setProfessorForm({...professorForm, expertise: e.target.value})}
                    className="w-full md:col-span-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  <AppIcons.Check size={18} />
                  {loading ? 'Registering...' : 'Register as Professor'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AppIcons.Shield size={48} className="text-blue-600 mr-4" />
              Admin Login
            </h2>
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 disabled:bg-gray-400"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false)
                    setAdminPassword('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
