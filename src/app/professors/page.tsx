// src/app/professors/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Upload, Download, Search, X, Edit2, Trash2, Check } from 'lucide-react'

interface Professor {
  id: string; name: string; email: string; college: string; department: string; designation: string; phone?: string; expertise?: string; createdAt: string
}

const departments = [
  'Computer Science','Information Technology','Electronics & Communication','Mechanical Engineering','Civil Engineering',
  'Electrical Engineering','Chemical Engineering','Aerospace Engineering','Biotechnology','Mathematics','Physics','Chemistry',
  'English Literature','Economics','Business Administration','Management Studies','Commerce','Psychology','Sociology',
  'Political Science','History','Philosophy','Fine Arts'
]
const designations = [
  'Professor','Associate Professor','Assistant Professor','Dr.','Dean','Head of Department','Principal','Director',
  'Lecturer','Senior Lecturer','Vice Chancellor','Pro Vice Chancellor','Registrar','Emeritus Professor','Visiting Professor','Research Professor'
]
const colleges = [
  'IIT Delhi','IIT Bombay','IIT Madras','IIT Kanpur','IIT Kharagpur','BITS Pilani','NIT Trichy','NIT Warangal',
  'IIIT Hyderabad','DTU Delhi','VIT Vellore','Manipal University','SRM University','Amity University',
  'Delhi University','Jawaharlal Nehru University','Jamia Millia Islamia','Anna University','Pune University',
  'Mumbai University','Bangalore University'
]

const designColors: Record<string, {bg:string,color:string}> = {
  'Professor':             {bg:'rgba(0,212,255,0.12)',  color:'#00d4ff'},
  'Associate Professor':   {bg:'rgba(34,197,94,0.12)',  color:'#22c55e'},
  'Assistant Professor':   {bg:'rgba(245,158,11,0.12)', color:'#f59e0b'},
  'Dr.':                   {bg:'rgba(168,85,247,0.12)', color:'#a855f7'},
  'Dean':                  {bg:'rgba(239,68,68,0.12)',  color:'#ef4444'},
  'Head of Department':    {bg:'rgba(99,102,241,0.12)', color:'#6366f1'},
  'Principal':             {bg:'rgba(236,72,153,0.12)', color:'#ec4899'},
  'Director':              {bg:'rgba(148,163,184,0.12)',color:'#94a3b8'},
}

const pageVariants = { initial:{opacity:0,y:20}, animate:{opacity:1,y:0,transition:{duration:0.3,ease:'easeOut' as const}} }

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [filtered, setFiltered] = useState<Professor[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [designFilter, setDesignFilter] = useState('')
  const [collegeFilter, setCollegeFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Professor | null>(null)
  const [loading, setLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [csvData, setCsvData] = useState('')
  const [formData, setFormData] = useState({ name:'',email:'',college:'',department:'',designation:'Professor',phone:'',expertise:'' })

  useEffect(() => { fetchProfessors() }, [])
  useEffect(() => {
    let f = professors
    if (search) f = f.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()) || p.college.toLowerCase().includes(search.toLowerCase()) || (p.expertise||'').toLowerCase().includes(search.toLowerCase()))
    if (deptFilter) f = f.filter(p => p.department === deptFilter)
    if (designFilter) f = f.filter(p => p.designation === designFilter)
    if (collegeFilter) f = f.filter(p => p.college.toLowerCase().includes(collegeFilter.toLowerCase()))
    setFiltered(f)
  }, [professors, search, deptFilter, designFilter, collegeFilter])

  const fetchProfessors = async () => { try { const r = await fetch('/api/professors'); setProfessors(await r.json()) } catch {} }
  const resetForm = () => { setFormData({name:'',email:'',college:'',department:'',designation:'Professor',phone:'',expertise:''}); setEditing(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const url = editing ? `/api/professors?id=${editing.id}` : '/api/professors'
      const r = await fetch(url, {method:editing?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(formData)})
      const result = await r.json()
      if (r.ok) { alert(`✅ Professor ${editing?'updated':'added'}!`); fetchProfessors(); resetForm() }
      else alert(`❌ ${result.error}`)
    } catch { alert('❌ Network error') }
    setLoading(false)
  }

  const handleEdit = (p: Professor) => { setFormData({name:p.name,email:p.email,college:p.college,department:p.department,designation:p.designation,phone:p.phone||'',expertise:p.expertise||''}); setEditing(p); setShowForm(true) }

  const handleDelete = async (p: Professor) => {
    if (!confirm(`Delete ${p.designation} ${p.name} from ${p.college}?`)) return
    setLoading(true)
    try {
      const r = await fetch(`/api/professors?id=${p.id}`,{method:'DELETE'})
      const result = await r.json()
      if (r.ok) { alert(`✅ ${result.message}`); fetchProfessors(); setSelected(prev=>prev.filter(id=>id!==p.id)) }
      else alert(`❌ ${result.error}`)
    } catch { alert('❌ Network error') }
    setLoading(false)
  }

  const handleBulkDelete = async () => {
    if (!selected.length) return
    if (!confirm(`Delete ${selected.length} professors?`)) return
    setLoading(true); let ok=0,fail=0
    for (const id of selected) { try { const r=await fetch(`/api/professors?id=${id}`,{method:'DELETE'}); r.ok?ok++:fail++ } catch{fail++} }
    alert(`Deleted: ${ok} | Failed: ${fail}`); fetchProfessors(); setSelected([]); setLoading(false)
  }

  const handleCSVImport = async () => {
    if (!csvData.trim()) return; setLoading(true)
    const lines = csvData.trim().split('\n'), headers = lines[0].toLowerCase().split(',').map(h=>h.trim())
    const missing = ['name','email','college','department'].filter(h=>!headers.includes(h))
    if (missing.length) { alert(`Missing: ${missing.join(', ')}`); setLoading(false); return }
    let ok=0,fail=0
    for (let i=1;i<lines.length;i++) {
      const values=lines[i].split(',').map(v=>v.trim()); const data:any={designation:'Professor'}
      headers.forEach((h,idx)=>{data[h]=values[idx]||''})
      if (!data.name||!data.email) continue
      try { const r=await fetch('/api/professors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); r.ok?ok++:fail++ } catch{fail++}
    }
    alert(`Import: ${ok} success, ${fail} failed`); if(ok) fetchProfessors(); setShowImport(false); setCsvData(''); setLoading(false)
  }

  const exportCSV = () => {
    if (!professors.length) { alert('No professors to export'); return }
    const csv = [['name','email','college','department','designation','phone','expertise'].join(','),...professors.map(p=>[p.name,p.email,p.college,p.department,p.designation,p.phone||'',p.expertise||''].join(','))].join('\n')
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=`professors-${Date.now()}.csv`; a.click()
  }

  const toggleSelect = (id:string) => setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  const selectAll = () => setSelected(selected.length===professors.length?[]:professors.map(p=>p.id))

  const modal = (open:boolean,onClose:()=>void,title:string,icon:React.ReactNode,children:React.ReactNode) => (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} transition={{duration:0.25}} className="card-plain"
            style={{width:'100%',maxWidth:'32rem',padding:'2rem',maxHeight:'90vh',overflowY:'auto',border:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
                <div style={{padding:'0.5rem',background:'rgba(168,85,247,0.12)',borderRadius:'0.5rem',color:'#a855f7'}}>{icon}</div>
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
        <Navigation/>
        <div style={{maxWidth:'80rem',margin:'0 auto',padding:'2rem 1.5rem'}}>
          {/* Header */}
          <div style={{display:'flex',flexWrap:'wrap',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',marginBottom:'2rem'}}>
            <div>
              <p style={{fontSize:'0.7rem',color:'#a855f7',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.35rem'}}>Admin Panel</p>
              <h1 style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:800,color:'var(--text-heading)'}}>Professors Management</h1>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>Total: <strong style={{color:'#a855f7'}}>{professors.length}</strong> · Filtered: <strong>{filtered.length}</strong> · Selected: <strong style={{color:'#f59e0b'}}>{selected.length}</strong></p>
            </div>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
              {selected.length>0&&(<motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={handleBulkDelete} disabled={loading} className="btn-danger"><Trash2 size={14}/> Delete ({selected.length})</motion.button>)}
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={()=>setShowImport(true)} className="btn-secondary" style={{borderColor:'#a855f7',color:'#a855f7'}}><Upload size={14}/> Import</motion.button>
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={exportCSV} className="btn-ghost"><Download size={14}/> Export</motion.button>
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={()=>setShowForm(true)} style={{background:'#a855f7',color:'#fff'}} className="btn-primary"><Plus size={14}/> Add Professor</motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="card-plain" style={{padding:'1.25rem',marginBottom:'1.5rem',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'0.75rem'}}>
            <div style={{position:'relative'}}>
              <Search size={14} style={{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
              <input className="input-field" style={{paddingLeft:'2.25rem'}} type="text" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="input-field" value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <select className="input-field" value={designFilter} onChange={e=>setDesignFilter(e.target.value)}>
              <option value="">All Designations</option>
              {designations.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <input className="input-field" type="text" placeholder="Filter college..." value={collegeFilter} onChange={e=>setCollegeFilter(e.target.value)}/>
            <button className="btn-ghost" onClick={()=>{setSearch('');setDeptFilter('');setDesignFilter('');setCollegeFilter('')}}><X size={14}/> Clear</button>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selected.length===professors.length&&professors.length>0} onChange={selectAll}/></th>
                  <th>Professor</th><th>College</th><th>Department</th><th>Expertise</th><th>Phone</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={7} style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>
                    <BookOpen size={40} style={{margin:'0 auto 0.75rem',opacity:0.3}}/>
                    <p style={{fontWeight:600}}>{professors.length===0?'No professors yet':'No results found'}</p>
                  </td></tr>
                ) : filtered.map((p,i) => {
                  const dc = designColors[p.designation] || {bg:'rgba(148,163,184,0.12)',color:'#94a3b8'}
                  return (
                    <motion.tr key={p.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}>
                      <td><input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggleSelect(p.id)}/></td>
                      <td>
                        <span style={{display:'inline-flex',padding:'0.15rem 0.5rem',borderRadius:'99px',fontSize:'0.65rem',fontWeight:600,background:dc.bg,color:dc.color,marginBottom:'0.25rem'}}>{p.designation}</span>
                        <div style={{fontWeight:600,color:'var(--text-heading)'}}>{p.name}</div>
                        <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{p.email}</div>
                      </td>
                      <td style={{color:'var(--text-primary)',fontSize:'0.85rem'}}>{p.college}</td>
                      <td style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{p.department}</td>
                      <td style={{fontSize:'0.8rem'}}>{p.expertise ? <span style={{color:'#f59e0b'}}>💡 {p.expertise}</span> : <span style={{color:'var(--text-muted)'}}>—</span>}</td>
                      <td style={{fontSize:'0.8rem',color:p.phone?'var(--success)':'var(--text-muted)'}}>{p.phone||'—'}</td>
                      <td>
                        <div style={{display:'flex',gap:'0.375rem'}}>
                          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>handleEdit(p)} className="btn-secondary" style={{padding:'0.3rem 0.6rem',fontSize:'0.75rem',borderColor:'#a855f7',color:'#a855f7'}}><Edit2 size={12}/> Edit</motion.button>
                          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>handleDelete(p)} disabled={loading} className="btn-danger" style={{padding:'0.3rem 0.6rem',fontSize:'0.75rem'}}><Trash2 size={12}/> Del</motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {modal(showForm, resetForm, editing?'Edit Professor':'Add Professor', editing?<Edit2 size={16}/>:<Plus size={16}/>,
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            <input className="input-field" type="text" placeholder="Full Name *" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} required/>
            <input className="input-field" type="email" placeholder="Email Address *" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} required/>
            <input className="input-field" type="text" placeholder="College/University *" value={formData.college} onChange={e=>setFormData({...formData,college:e.target.value})} list="p-colleges" required/>
            <datalist id="p-colleges">{colleges.map(c=><option key={c} value={c}/>)}</datalist>
            <select className="input-field" value={formData.department} onChange={e=>setFormData({...formData,department:e.target.value})} required>
              <option value="">Select Department *</option>
              {departments.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <select className="input-field" value={formData.designation} onChange={e=>setFormData({...formData,designation:e.target.value})}>
              {designations.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <input className="input-field" type="tel" placeholder="Phone" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})}/>
            <input className="input-field" type="text" placeholder="Expertise / Subject Area" value={formData.expertise} onChange={e=>setFormData({...formData,expertise:e.target.value})}/>
            <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} type="submit" disabled={loading} style={{background:'#a855f7',color:'#fff',flex:1,justifyContent:'center'}} className="btn-primary">
                {loading?<div className="spinner"/>:<Check size={14}/>} {loading?'Saving...':(editing?'Update':'Add Professor')}
              </motion.button>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} type="button" onClick={resetForm} className="btn-ghost">Cancel</motion.button>
            </div>
          </form>
        )}

        {/* CSV Import Modal */}
        {modal(showImport,()=>{setShowImport(false);setCsvData('')},'Import Professors from CSV',<Upload size={16}/>,
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{background:'var(--bg-input)',borderRadius:'0.5rem',padding:'0.875rem',fontFamily:'monospace',fontSize:'0.75rem',color:'var(--text-muted)',border:'1px solid var(--border-card)'}}>
              name,email,college,department,designation,phone,expertise<br/>
              Dr. Sharma,sharma@iit.ac.in,IIT Delhi,Computer Science,Professor,98765,AI
            </div>
            <textarea className="input-field" style={{minHeight:'8rem',fontFamily:'monospace',fontSize:'0.8rem',resize:'vertical'}} placeholder="Paste CSV data..." value={csvData} onChange={e=>setCsvData(e.target.value)}/>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={handleCSVImport} disabled={loading||!csvData.trim()} style={{background:'#a855f7',color:'#fff',flex:1,justifyContent:'center'}} className="btn-primary">
                {loading?<div className="spinner"/>:<Upload size={14}/>} {loading?'Importing...':'Import'}
              </motion.button>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={()=>{setShowImport(false);setCsvData('')}} className="btn-ghost">Cancel</motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </AdminProtection>
  )
}
