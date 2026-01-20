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
 <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 text-gray-600">
      {/* Enhanced Header */}
      <header className="bg-white shadow-xl border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <AppIcons.Rocket size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Invitation System
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Streamlined event management platform</p>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              {!isAdmin ? (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-gray-900 hover:to-black flex items-center gap-2 shadow-lg transition-all font-medium"
                >
                  <AppIcons.Lock size={16} />
                  <span className="text-sm sm:text-base">Admin Login</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="/dashboard"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 shadow-lg transition-all font-medium"
                  >
                    <AppIcons.Dashboard size={16} />
                    <span className="text-sm sm:text-base">Dashboard</span>
                  </a>
                  <button
                    onClick={logout}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-red-700 hover:to-red-800 flex items-center justify-center gap-2 shadow-lg transition-all font-medium"
                  >
                    <AppIcons.Logout size={16} />
                    <span className="text-sm sm:text-base">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Enhanced Registration Tabs */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-200 border-hidden">
          {/* Enhanced Tab Navigation */}
          <div className="flex bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-4 sm:py-6 px-4 sm:px-6 text-center font-semibold transition-all duration-300 relative ${
                activeTab === 'student' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <AppIcons.Students size={24} />
                <span className="text-sm sm:text-base">Student Registration</span>
              </div>
              {activeTab === 'student' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-800"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('guest')}
              className={`flex-1 py-4 sm:py-6 px-4 sm:px-6 text-center font-semibold transition-all duration-300 relative ${
                activeTab === 'guest' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <AppIcons.Guests size={24} />
                <span className="text-sm sm:text-base">Guest Registration</span>
              </div>
              {activeTab === 'guest' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-800"></div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('professor')}
              className={`flex-1 py-4 sm:py-6 px-4 sm:px-6 text-center font-semibold transition-all duration-300 relative ${
                activeTab === 'professor' 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <AppIcons.Professors size={24} />
                <span className="text-sm sm:text-base">Professor Registration</span>
              </div>
              {activeTab === 'professor' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-800"></div>
              )}
            </button>
          </div>

          {/* Enhanced Registration Forms */}
          <div className="p-6 sm:p-8 lg:p-12">
            {/* Enhanced Student Form */}
            {activeTab === 'student' && (
              <form onSubmit={handleStudentSubmit} className="space-y-6 sm:space-y-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                    <AppIcons.Students size={28} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Registration</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Register to receive event invitations</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
                    <select
                      value={studentForm.course}
                      onChange={(e) => setStudentForm({...studentForm, course: e.target.value})}
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
                      value={studentForm.year}
                      onChange={(e) => setStudentForm({...studentForm, year: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select Year *</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <AppIcons.Check size={18} />
                  )}
                  <span>{loading ? 'Registering...' : 'Register as Student'}</span>
                </button>
              </form>
            )}

            {/* Enhanced Guest Form */}
            {activeTab === 'guest' && (
              <form onSubmit={handleGuestSubmit} className="space-y-6 sm:space-y-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-green-100 to-green-200 rounded-xl">
                    <AppIcons.Guests size={28} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Guest Registration</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Register to receive event invitations</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={guestForm.name}
                      onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization/Company *</label>
                    <input
                      type="text"
                      placeholder="Enter your organization name"
                      value={guestForm.organization}
                      onChange={(e) => setGuestForm({...guestForm, organization: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Designation *</label>
                    <input
                      type="text"
                      placeholder="Enter your designation"
                      value={guestForm.designation}
                      onChange={(e) => setGuestForm({...guestForm, designation: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm({...guestForm, phone: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={guestForm.category}
                      onChange={(e) => setGuestForm({...guestForm, category: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 sm:py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <AppIcons.Check size={18} />
                  )}
                  <span>{loading ? 'Registering...' : 'Register as Guest'}</span>
                </button>
              </form>
            )}

            {/* Enhanced Professor Form */}
            {activeTab === 'professor' && (
              <form onSubmit={handleProfessorSubmit} className="space-y-6 sm:space-y-8">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                    <AppIcons.Professors size={28} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Professor Registration</h2>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Register to receive event invitations</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={professorForm.name}
                      onChange={(e) => setProfessorForm({...professorForm, name: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={professorForm.email}
                      onChange={(e) => setProfessorForm({...professorForm, email: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">College/University Name *</label>
                    <input
                      type="text"
                      placeholder="Enter your institution name"
                      value={professorForm.college}
                      onChange={(e) => setProfessorForm({...professorForm, college: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <select
                      value={professorForm.department}
                      onChange={(e) => setProfessorForm({...professorForm, department: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select Department *</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                    <select
                      value={professorForm.designation}
                      onChange={(e) => setProfessorForm({...professorForm, designation: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      {designations.map(designation => (
                        <option key={designation} value={designation}>{designation}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={professorForm.phone}
                      onChange={(e) => setProfessorForm({...professorForm, phone: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expertise/Subject Area</label>
                    <input
                      type="text"
                      placeholder="Enter your area of expertise"
                      value={professorForm.expertise}
                      onChange={(e) => setProfessorForm({...professorForm, expertise: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 sm:py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <AppIcons.Check size={18} />
                  )}
                  <span>{loading ? 'Registering...' : 'Register as Professor'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-gray-200">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <AppIcons.Shield size={28} className="text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Login</h2>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3 px-4 rounded-xl hover:from-gray-900 hover:to-black disabled:from-gray-400 disabled:to-gray-400 font-medium shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <AppIcons.Lock size={16} />
                  )}
                  <span>{loading ? 'Logging in...' : 'Login'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLogin(false)
                    setAdminPassword('')
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 py-3 px-4 rounded-xl hover:from-gray-400 hover:to-gray-500 font-medium transition-all"
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
