'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Users, BookOpen, Rocket, Lock, LogOut,
  LayoutDashboard, Check, X, Shield, ChevronRight
} from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

const tabs = [
  { id: 'student',   label: 'Student',   icon: GraduationCap, color: 'var(--accent)' },
  { id: 'guest',     label: 'Guest',     icon: Users,         color: '#22c55e' },
  { id: 'professor', label: 'Professor', icon: BookOpen,      color: '#a855f7' },
] as const

type Tab = typeof tabs[number]['id']

const courses = [
  'Computer Science','Information Technology','Electronics & Communication',
  'Mechanical Engineering','Civil Engineering','Electrical Engineering',
  'Business Administration','Commerce','Arts','Science',
]
const years = ['1st Year','2nd Year','3rd Year','4th Year','Final Year']
const categories = ['guest','vip','alumni','industry','media','sponsor','speaker']
const departments = [
  'Computer Science','Information Technology','Electronics & Communication',
  'Mechanical Engineering','Civil Engineering','Electrical Engineering',
  'Mathematics','Physics','Chemistry','English','Business Administration',
]
const designations = [
  'Professor','Associate Professor','Assistant Professor','Dr.','Dean',
  'Head of Department','Principal','Director','Lecturer','Senior Lecturer',
]

export default function HomePage() {
  const { isAdmin, login, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('student')
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [studentForm, setStudentForm] = useState({ name:'',email:'',course:'',year:'',phone:'' })
  const [guestForm, setGuestForm] = useState({ name:'',email:'',organization:'',designation:'',phone:'',category:'guest' })
  const [professorForm, setProfessorForm] = useState({ name:'',email:'',college:'',department:'',designation:'Professor',phone:'',expertise:'' })

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(adminPassword)
    if (result.success) {
      setShowAdminLogin(false)
      setAdminPassword('')
      window.location.href = '/dashboard'
    } else {
      alert(`❌ ${result.error}`)
    }
    setLoading(false)
  }

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/students', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(studentForm) })
      if (r.ok) { alert('✅ Student registration successful!'); setStudentForm({name:'',email:'',course:'',year:'',phone:''}) }
      else { const d = await r.json(); alert(`❌ ${d.error}`) }
    } catch { alert('❌ Registration failed. Please try again.') }
    setLoading(false)
  }

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/guests', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(guestForm) })
      if (r.ok) { alert('✅ Guest registration successful!'); setGuestForm({name:'',email:'',organization:'',designation:'',phone:'',category:'guest'}) }
      else { const d = await r.json(); alert(`❌ ${d.error}`) }
    } catch { alert('❌ Registration failed. Please try again.') }
    setLoading(false)
  }

  const handleProfSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const r = await fetch('/api/professors', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(professorForm) })
      if (r.ok) { alert('✅ Professor registration successful!'); setProfessorForm({name:'',email:'',college:'',department:'',designation:'Professor',phone:'',expertise:''}) }
      else { const d = await r.json(); alert(`❌ ${d.error}`) }
    } catch { alert('❌ Registration failed. Please try again.') }
    setLoading(false)
  }

  const formInputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-input)',
    borderRadius: '0.625rem',
    padding: '0.75rem 1rem',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Header */}
      <header style={{
        background: 'var(--bg-nav)',
        borderBottom: '1px solid var(--border-card)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--accent)', borderRadius: '0.5rem' }}>
              <Rocket size={22} style={{ color: '#0a1628' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1 }}>Invitation System</h1>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Streamlined event management platform</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ThemeToggle />
            {!isAdmin ? (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => setShowAdminLogin(true)}
                className="btn-secondary"
              >
                <Lock size={14} /> Admin Login
              </motion.button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <motion.a whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} href="/dashboard" className="btn-primary">
                  <LayoutDashboard size={14} /> Dashboard
                </motion.a>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={logout} className="btn-danger">
                  <LogOut size={14} /> Logout
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ maxWidth: '48rem', margin: '3rem auto 0', padding: '0 1.5rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
            🎓 College Event Management
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1.15, marginBottom: '1rem' }}>
            Register to receive <span style={{ color: 'var(--accent)' }}>event invitations</span>
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            Join our invitation list and stay updated with all college events — seminars, workshops, cultural programs & more.
          </p>
        </motion.div>
      </div>

      {/* Registration Card */}
      <div style={{ maxWidth: '44rem', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-plain"
          style={{ overflow: 'hidden' }}
        >
          {/* Tab bar */}
          <div style={{ display: 'flex', background: 'var(--bg-table-hd)', borderBottom: '1px solid var(--border-card)' }}>
            {tabs.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '1rem 0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: active ? 'var(--bg-card)' : 'transparent',
                    border: 'none',
                    borderBottom: active ? `2px solid ${tab.color}` : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: active ? tab.color : 'var(--text-muted)',
                  }}
                >
                  <Icon size={18} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Forms */}
          <div style={{ padding: '2rem' }}>
            <AnimatePresence mode="wait">

              {/* Student Form */}
              {activeTab === 'student' && (
                <motion.form
                  key="student"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleStudentSubmit}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.625rem', background: 'rgba(0,212,255,0.12)', borderRadius: '0.5rem' }}>
                      <GraduationCap size={20} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>Student Registration</h2>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Register to receive event invitations</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <input className="input-field" type="text" placeholder="Full Name *" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} required />
                    <input className="input-field" type="email" placeholder="Email Address *" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} required />
                    <select className="input-field" value={studentForm.course} onChange={e => setStudentForm({...studentForm, course: e.target.value})} required>
                      <option value="">Select Course *</option>
                      {courses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select className="input-field" value={studentForm.year} onChange={e => setStudentForm({...studentForm, year: e.target.value})} required>
                      <option value="">Select Year *</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <input className="input-field" type="tel" placeholder="Phone Number" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} style={{ gridColumn: '1 / -1' }} />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem' }}>
                    {loading ? <div className="spinner" /> : <Check size={16} />}
                    {loading ? 'Registering...' : 'Register as Student'}
                  </motion.button>
                </motion.form>
              )}

              {/* Guest Form */}
              {activeTab === 'guest' && (
                <motion.form
                  key="guest"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleGuestSubmit}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.625rem', background: 'rgba(34,197,94,0.12)', borderRadius: '0.5rem' }}>
                      <Users size={20} style={{ color: '#22c55e' }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>Guest Registration</h2>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Register to receive event invitations</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <input className="input-field" type="text" placeholder="Full Name *" value={guestForm.name} onChange={e => setGuestForm({...guestForm, name: e.target.value})} required />
                    <input className="input-field" type="email" placeholder="Email Address *" value={guestForm.email} onChange={e => setGuestForm({...guestForm, email: e.target.value})} required />
                    <input className="input-field" type="text" placeholder="Organization/Company *" value={guestForm.organization} onChange={e => setGuestForm({...guestForm, organization: e.target.value})} required />
                    <input className="input-field" type="text" placeholder="Designation *" value={guestForm.designation} onChange={e => setGuestForm({...guestForm, designation: e.target.value})} required />
                    <input className="input-field" type="tel" placeholder="Phone Number" value={guestForm.phone} onChange={e => setGuestForm({...guestForm, phone: e.target.value})} />
                    <select className="input-field" value={guestForm.category} onChange={e => setGuestForm({...guestForm, category: e.target.value})}>
                      {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={{ ...formInputStyle, background: '#22c55e', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem' }}>
                    {loading ? <div className="spinner" /> : <Check size={16} />}
                    {loading ? 'Registering...' : 'Register as Guest'}
                  </motion.button>
                </motion.form>
              )}

              {/* Professor Form */}
              {activeTab === 'professor' && (
                <motion.form
                  key="professor"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleProfSubmit}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.625rem', background: 'rgba(168,85,247,0.12)', borderRadius: '0.5rem' }}>
                      <BookOpen size={20} style={{ color: '#a855f7' }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>Professor Registration</h2>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Register to receive event invitations</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <input className="input-field" type="text" placeholder="Full Name *" value={professorForm.name} onChange={e => setProfessorForm({...professorForm, name: e.target.value})} required />
                    <input className="input-field" type="email" placeholder="Email Address *" value={professorForm.email} onChange={e => setProfessorForm({...professorForm, email: e.target.value})} required />
                    <input className="input-field" type="text" placeholder="College/University *" value={professorForm.college} onChange={e => setProfessorForm({...professorForm, college: e.target.value})} required />
                    <select className="input-field" value={professorForm.department} onChange={e => setProfessorForm({...professorForm, department: e.target.value})} required>
                      <option value="">Select Department *</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <select className="input-field" value={professorForm.designation} onChange={e => setProfessorForm({...professorForm, designation: e.target.value})}>
                      {designations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input className="input-field" type="tel" placeholder="Phone Number" value={professorForm.phone} onChange={e => setProfessorForm({...professorForm, phone: e.target.value})} />
                    <input className="input-field" type="text" placeholder="Expertise/Subject Area" value={professorForm.expertise} onChange={e => setProfessorForm({...professorForm, expertise: e.target.value})} style={{ gridColumn: '1 / -1' }} />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={{ ...formInputStyle, background: '#a855f7', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem' }}>
                    {loading ? <div className="spinner" /> : <Check size={16} />}
                    {loading ? 'Registering...' : 'Register as Professor'}
                  </motion.button>
                </motion.form>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}
        >
          {[
            { icon: '📧', label: 'Email Invites' },
            { icon: '💬', label: 'WhatsApp Alerts' },
            { icon: '📱', label: 'SMS Notifications' },
          ].map(f => (
            <div key={f.label} style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: '0.75rem', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{f.icon}</div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{f.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={e => { if (e.target === e.currentTarget) { setShowAdminLogin(false); setAdminPassword('') } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="card-plain"
              style={{ width: '100%', maxWidth: '22rem', padding: '2rem', border: '1px solid var(--border)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--accent-glow)', borderRadius: '0.5rem' }}>
                    <Shield size={18} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>Admin Login</h2>
                </div>
                <button onClick={() => { setShowAdminLogin(false); setAdminPassword('') }} className="btn-ghost" style={{ padding: '0.25rem' }}>
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleAdminLogin}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  Admin Password
                </label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="input-field"
                  style={{ marginBottom: '1.25rem' }}
                  required
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    {loading ? <div className="spinner" /> : <Lock size={14} />}
                    {loading ? 'Logging in...' : 'Login'}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" onClick={() => { setShowAdminLogin(false); setAdminPassword('') }} className="btn-ghost">
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
