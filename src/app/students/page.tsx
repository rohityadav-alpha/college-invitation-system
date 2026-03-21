// src/app/students/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import StatusBadge from '@/components/StatusBadge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Plus, Upload, Download, Search, X,
  Edit2, Trash2, Check
} from 'lucide-react'

interface Student {
  id: string; name: string; email: string; course: string; year: string; phone?: string; createdAt: string
}

const courses = [
  'Computer Science','Information Technology','Electronics & Communication',
  'Mechanical Engineering','Civil Engineering','Electrical Engineering',
  'Business Administration','Commerce','Arts','Science',
]
const years = ['1st Year','2nd Year','3rd Year','4th Year','Final Year']

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [filtered, setFiltered] = useState<Student[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [loading, setLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [csvData, setCsvData] = useState('')
  const [formData, setFormData] = useState({ name:'',email:'',course:'',year:'',phone:'' })

  useEffect(() => { fetchStudents() }, [])
  useEffect(() => {
    let f = students
    if (search) f = f.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
    if (courseFilter) f = f.filter(s => s.course === courseFilter)
    if (yearFilter) f = f.filter(s => s.year === yearFilter)
    setFiltered(f)
  }, [students, search, courseFilter, yearFilter])

  const fetchStudents = async () => {
    try { const r = await fetch('/api/students'); setStudents(await r.json()) } catch {}
  }

  const resetForm = () => { setFormData({name:'',email:'',course:'',year:'',phone:''}); setEditing(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const url = editing ? `/api/students?id=${editing.id}` : '/api/students'
      const r = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(formData) })
      const result = await r.json()
      if (r.ok) { alert(`✅ Student ${editing ? 'updated' : 'added'}!`); fetchStudents(); resetForm() }
      else alert(`❌ ${result.error}`)
    } catch { alert('❌ Network error') }
    setLoading(false)
  }

  const handleEdit = (s: Student) => { setFormData({ name:s.name,email:s.email,course:s.course,year:s.year,phone:s.phone||'' }); setEditing(s); setShowForm(true) }

  const handleDelete = async (s: Student) => {
    if (!confirm(`Delete ${s.name}? This cannot be undone.`)) return
    setLoading(true)
    try {
      const r = await fetch(`/api/students?id=${s.id}`, { method:'DELETE' })
      const result = await r.json()
      if (r.ok) { alert(`✅ ${result.message}`); fetchStudents(); setSelected(p => p.filter(id => id !== s.id)) }
      else alert(`❌ ${result.error}`)
    } catch { alert('❌ Network error') }
    setLoading(false)
  }

  const handleBulkDelete = async () => {
    if (!selected.length) return
    if (!confirm(`Delete ${selected.length} students? Cannot be undone.`)) return
    setLoading(true)
    let ok = 0, fail = 0
    for (const id of selected) {
      try { const r = await fetch(`/api/students?id=${id}`, {method:'DELETE'}); r.ok ? ok++ : fail++ } catch { fail++ }
    }
    alert(`Deleted: ${ok} | Failed: ${fail}`); fetchStudents(); setSelected([]); setLoading(false)
  }

  const handleCSVImport = async () => {
    if (!csvData.trim()) return
    setLoading(true)
    const lines = csvData.trim().split('\n')
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim())
    const required = ['name','email','course','year']
    const missing = required.filter(h => !headers.includes(h))
    if (missing.length) { alert(`Missing headers: ${missing.join(', ')}`); setLoading(false); return }
    let ok = 0, fail = 0
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const data: { [key: string]: string } = {}
      headers.forEach((h, idx) => { data[h] = values[idx] || '' })
      if (!data.name || !data.email) continue
      try { const r = await fetch('/api/students', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); r.ok ? ok++ : fail++ }
      catch { fail++ }
    }
    alert(`Import done: ${ok} success, ${fail} failed`); if (ok) fetchStudents(); setShowImport(false); setCsvData(''); setLoading(false)
  }

  const exportCSV = () => {
    if (!students.length) { alert('No students to export'); return }
    const csv = [['name','email','course','year','phone','createdAt'].join(','),...students.map(s => [s.name,s.email,s.course,s.year,s.phone||'',new Date(s.createdAt).toISOString().split('T')[0]].join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download = `students-${Date.now()}.csv`; a.click()
  }

  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const selectAll = () => setSelected(selected.length === students.length ? [] : students.map(s => s.id))

  const modal = (open: boolean, onClose: () => void, title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} transition={{duration:0.25,ease:'easeOut' as const}}
            className="card-plain" style={{width:'100%',maxWidth:'28rem',padding:'2rem',maxHeight:'90vh',overflowY:'auto',border:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
                <div style={{padding:'0.5rem',background:'var(--accent-glow)',borderRadius:'0.5rem',color:'var(--accent)'}}>{icon}</div>
                <h2 style={{fontSize:'1rem',fontWeight:700,color:'var(--text-heading)'}}>{title}</h2>
              </div>
              <button onClick={onClose} className="btn-ghost" style={{padding:'0.25rem'}}><X size={16}/></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <AdminProtection>
      <motion.div variants={pageVariants} initial="initial" animate="animate" style={{minHeight:'100vh',background:'var(--bg-primary)'}}>
        <Navigation />
        <div style={{maxWidth:'80rem',margin:'0 auto',padding:'2rem 1.5rem'}}>

          {/* Header */}
          <div style={{display:'flex',flexWrap:'wrap',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',marginBottom:'2rem'}}>
            <div>
              <p style={{fontSize:'0.7rem',color:'var(--accent)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.35rem'}}>Admin Panel</p>
              <h1 style={{fontSize:'clamp(1.4rem, 3vw, 2rem)',fontWeight:800,color:'var(--text-heading)'}}>Students Management</h1>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>Total: <strong style={{color:'var(--accent)'}}>{students.length}</strong> · Filtered: <strong style={{color:'var(--text-primary)'}}>{filtered.length}</strong> · Selected: <strong style={{color:'#f59e0b'}}>{selected.length}</strong></p>
            </div>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
              {selected.length > 0 && (
                <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={handleBulkDelete} disabled={loading} className="btn-danger">
                  <Trash2 size={14}/> Delete ({selected.length})
                </motion.button>
              )}
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={() => setShowImport(true)} className="btn-secondary">
                <Upload size={14}/> Import
              </motion.button>
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={exportCSV} className="btn-ghost">
                <Download size={14}/> Export
              </motion.button>
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={() => setShowForm(true)} className="btn-primary">
                <Plus size={14}/> Add Student
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="card-plain" style={{padding:'1.25rem',marginBottom:'1.5rem',display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))',gap:'0.75rem'}}>
            <div style={{position:'relative'}}>
              <Search size={14} style={{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
              <input className="input-field" style={{paddingLeft:'2.25rem'}} type="text" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-field" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input-field" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="btn-ghost" onClick={() => { setSearch(''); setCourseFilter(''); setYearFilter('') }}>
              <X size={14}/> Clear
            </button>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selected.length === students.length && students.length > 0} onChange={selectAll}/></th>
                  <th>Student</th><th>Course</th><th>Year</th><th>Phone</th><th>Added</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>
                    <GraduationCap size={40} style={{margin:'0 auto 0.75rem',opacity:0.3}}/>
                    <p style={{fontWeight:600}}>{students.length === 0 ? 'No students yet' : 'No results found'}</p>
                    <p style={{fontSize:'0.8rem'}}>Try adjusting filters or add a student</p>
                  </td></tr>
                ) : filtered.map((s, i) => (
                  <motion.tr key={s.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}>
                    <td><input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)}/></td>
                    <td>
                      <div style={{fontWeight:600,color:'var(--text-heading)'}}>{s.name}</div>
                      <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{s.email}</div>
                    </td>
                    <td style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{s.course}</td>
                    <td><span className="badge badge-sent">{s.year}</span></td>
                    <td style={{fontSize:'0.8rem',color:s.phone?'var(--success)':'var(--text-muted)'}}>{s.phone||'—'}</td>
                    <td style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{display:'flex',gap:'0.375rem'}}>
                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => handleEdit(s)} className="btn-secondary" style={{padding:'0.3rem 0.6rem',fontSize:'0.75rem'}}>
                          <Edit2 size={12}/> Edit
                        </motion.button>
                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={() => handleDelete(s)} disabled={loading} className="btn-danger" style={{padding:'0.3rem 0.6rem',fontSize:'0.75rem'}}>
                          <Trash2 size={12}/> Del
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {modal(showForm, resetForm, editing ? 'Edit Student' : 'Add Student', editing ? <Edit2 size={16}/> : <Plus size={16}/>,
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
            <input className="input-field" type="text" placeholder="Full Name *" value={formData.name} onChange={e => setFormData({...formData,name:e.target.value})} required/>
            <input className="input-field" type="email" placeholder="Email Address *" value={formData.email} onChange={e => setFormData({...formData,email:e.target.value})} required/>
            <select className="input-field" value={formData.course} onChange={e => setFormData({...formData,course:e.target.value})} required>
              <option value="">Select Course *</option>
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="input-field" value={formData.year} onChange={e => setFormData({...formData,year:e.target.value})} required>
              <option value="">Select Year *</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <input className="input-field" type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData,phone:e.target.value})}/>
            <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} type="submit" disabled={loading} className="btn-primary" style={{flex:1,justifyContent:'center'}}>
                {loading ? <div className="spinner"/> : <Check size={14}/>} {loading ? 'Saving...' : (editing ? 'Update' : 'Add Student')}
              </motion.button>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} type="button" onClick={resetForm} className="btn-ghost">Cancel</motion.button>
            </div>
          </form>
        )}

        {/* CSV Import Modal */}
        {modal(showImport, () => {setShowImport(false);setCsvData('')}, 'Import from CSV', <Upload size={16}/>,
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{background:'var(--bg-input)',borderRadius:'0.5rem',padding:'0.875rem',fontFamily:'monospace',fontSize:'0.75rem',color:'var(--text-muted)',border:'1px solid var(--border-card)'}}>
              name,email,course,year,phone<br/>
              John Doe,john@example.com,Computer Science,1st Year,9876543210
            </div>
            <textarea className="input-field" style={{minHeight:'8rem',fontFamily:'monospace',fontSize:'0.8rem',resize:'vertical'}} placeholder="Paste CSV data here..." value={csvData} onChange={e => setCsvData(e.target.value)}/>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={handleCSVImport} disabled={loading||!csvData.trim()} className="btn-primary" style={{flex:1,justifyContent:'center'}}>
                {loading ? <div className="spinner"/> : <Upload size={14}/>} {loading ? 'Importing...' : 'Import'}
              </motion.button>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={() => {setShowImport(false);setCsvData('')}} className="btn-ghost">Cancel</motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </AdminProtection>
  )
}
