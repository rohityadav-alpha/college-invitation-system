// src/app/guests/page.tsx
'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Upload, Download, Search, X, Edit2, Trash2, Check } from 'lucide-react'

interface Guest {
  id: string; name: string; email: string; organization: string; designation: string; category: string; phone?: string; createdAt: string
}

const categories = ['guest','vip','alumni','industry','media','sponsor','speaker','judge','chief guest']
const organizations = ['Microsoft','Google','Amazon','IBM','TCS','Infosys','Wipro','Tech Mahindra','Accenture','Deloitte','Government','Startup','NGO','Media House','University']

const catColors: Record<string, string> = {
  guest:'rgba(0,212,255,0.12)',vip:'rgba(168,85,247,0.12)',alumni:'rgba(34,197,94,0.12)',
  industry:'rgba(245,158,11,0.12)',media:'rgba(239,68,68,0.12)',sponsor:'rgba(251,191,36,0.12)',
  speaker:'rgba(99,102,241,0.12)',judge:'rgba(236,72,153,0.12)','chief guest':'rgba(148,163,184,0.12)'
}
const catText: Record<string, string> = {
  guest:'#00d4ff',vip:'#a855f7',alumni:'#22c55e',industry:'#f59e0b',media:'#ef4444',
  sponsor:'#fbbf24',speaker:'#6366f1',judge:'#ec4899','chief guest':'#94a3b8'
}

const pageVariants = { initial:{opacity:0,y:20}, animate:{opacity:1,y:0,transition:{duration:0.3,ease:'easeOut' as const}} }

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [filtered, setFiltered] = useState<Guest[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [orgFilter, setOrgFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Guest | null>(null)
  const [loading, setLoading] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [csvData, setCsvData] = useState('')
  const [formData, setFormData] = useState({ name:'',email:'',organization:'',designation:'',category:'guest',phone:'' })

  useEffect(() => { fetchGuests() }, [])
  useEffect(() => {
    let f = guests
    if (search) f = f.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase()) || g.organization.toLowerCase().includes(search.toLowerCase()))
    if (catFilter) f = f.filter(g => g.category === catFilter)
    if (orgFilter) f = f.filter(g => g.organization.toLowerCase().includes(orgFilter.toLowerCase()))
    setFiltered(f)
  }, [guests, search, catFilter, orgFilter])

  const fetchGuests = async () => { try { const r = await fetch('/api/guests'); setGuests(await r.json()) } catch {} }
  const resetForm = () => { setFormData({name:'',email:'',organization:'',designation:'',category:'guest',phone:''}); setEditing(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const url = editing ? `/api/guests?id=${editing.id}` : '/api/guests'
      const r = await fetch(url, {method:editing?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(formData)})
      const result = await r.json()
      if (r.ok) { alert(`✅ Guest ${editing?'updated':'added'}!`); fetchGuests(); resetForm() }
      else alert(`❌ ${result.error}`)
    } catch { alert('❌ Network error') }
    setLoading(false)
  }

  const handleEdit = (g: Guest) => { setFormData({name:g.name,email:g.email,organization:g.organization,designation:g.designation,category:g.category,phone:g.phone||''}); setEditing(g); setShowForm(true) }

  const handleDelete = async (g: Guest) => {
    if (!confirm(`Delete ${g.name} from ${g.organization}? Cannot be undone.`)) return
    setLoading(true)
    try {
      const r = await fetch(`/api/guests?id=${g.id}`, {method:'DELETE'})
      const result = await r.json()
      if (r.ok) { alert(`✅ ${result.message}`); fetchGuests(); setSelected(p => p.filter(id => id!==g.id)) }
      else alert(`❌ ${result.error}`)
    } catch { alert('❌ Network error') }
    setLoading(false)
  }

  const handleBulkDelete = async () => {
    if (!selected.length) return
    if (!confirm(`Delete ${selected.length} guests?`)) return
    setLoading(true); let ok=0,fail=0
    for (const id of selected) { try { const r=await fetch(`/api/guests?id=${id}`,{method:'DELETE'}); r.ok?ok++:fail++ } catch{fail++} }
    alert(`Deleted: ${ok} | Failed: ${fail}`); fetchGuests(); setSelected([]); setLoading(false)
  }

  const handleCSVImport = async () => {
    if (!csvData.trim()) return; setLoading(true)
    const lines = csvData.trim().split('\n'), headers = lines[0].toLowerCase().split(',').map(h=>h.trim())
    const missing = ['name','email','organization','designation'].filter(h=>!headers.includes(h))
    if (missing.length) { alert(`Missing: ${missing.join(', ')}`); setLoading(false); return }
    let ok=0,fail=0
    for (let i=1;i<lines.length;i++) {
      const values=lines[i].split(',').map(v=>v.trim()); const data:any={category:'guest'}
      headers.forEach((h,idx)=>{data[h]=values[idx]||''})
      if (!data.name||!data.email) continue
      try { const r=await fetch('/api/guests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); r.ok?ok++:fail++ } catch{fail++}
    }
    alert(`Import: ${ok} success, ${fail} failed`); if(ok) fetchGuests(); setShowImport(false); setCsvData(''); setLoading(false)
  }

  const exportCSV = () => {
    if (!guests.length) { alert('No guests to export'); return }
    const csv = [['name','email','organization','designation','category','phone'].join(','),...guests.map(g=>[g.name,g.email,g.organization,g.designation,g.category,g.phone||''].join(','))].join('\n')
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=`guests-${Date.now()}.csv`; a.click()
  }

  const toggleSelect = (id: string) => setSelected(p => p.includes(id)?p.filter(x=>x!==id):[...p,id])
  const selectAll = () => setSelected(selected.length===guests.length?[]:guests.map(g=>g.id))

  const modal = (open:boolean, onClose:()=>void, title:string, icon:React.ReactNode, children:React.ReactNode) => (
    <AnimatePresence>
      {open && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} transition={{duration:0.25}} className="card-plain"
            style={{width:'100%',maxWidth:'28rem',padding:'2rem',maxHeight:'90vh',overflowY:'auto',border:'1px solid var(--border)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
                <div style={{padding:'0.5rem',background:'rgba(34,197,94,0.12)',borderRadius:'0.5rem',color:'#22c55e'}}>{icon}</div>
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
              <p style={{fontSize:'0.7rem',color:'#22c55e',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.35rem'}}>Admin Panel</p>
              <h1 style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:800,color:'var(--text-heading)'}}>Guests Management</h1>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>Total: <strong style={{color:'#22c55e'}}>{guests.length}</strong> · Filtered: <strong>{filtered.length}</strong> · Selected: <strong style={{color:'#f59e0b'}}>{selected.length}</strong></p>
            </div>
            <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
              {selected.length > 0 && (<motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={handleBulkDelete} disabled={loading} className="btn-danger"><Trash2 size={14}/> Delete ({selected.length})</motion.button>)}
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={()=>setShowImport(true)} className="btn-secondary" style={{borderColor:'#22c55e',color:'#22c55e'}}><Upload size={14}/> Import</motion.button>
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={exportCSV} className="btn-ghost"><Download size={14}/> Export</motion.button>
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={()=>setShowForm(true)} style={{background:'#22c55e',color:'#0a1628'}} className="btn-primary"><Plus size={14}/> Add Guest</motion.button>
            </div>
          </div>

          {/* Filters */}
          <div className="card-plain" style={{padding:'1.25rem',marginBottom:'1.5rem',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'0.75rem'}}>
            <div style={{position:'relative'}}>
              <Search size={14} style={{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
              <input className="input-field" style={{paddingLeft:'2.25rem'}} type="text" placeholder="Search guests..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="input-field" value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
            <input className="input-field" type="text" placeholder="Filter organization..." value={orgFilter} onChange={e=>setOrgFilter(e.target.value)}/>
            <button className="btn-ghost" onClick={()=>{setSearch('');setCatFilter('');setOrgFilter('')}}><X size={14}/> Clear</button>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selected.length===guests.length&&guests.length>0} onChange={selectAll}/></th>
                  <th>Guest</th><th>Organization</th><th>Category</th><th>Phone</th><th>Added</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={7} style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>
                    <Users size={40} style={{margin:'0 auto 0.75rem',opacity:0.3}}/>
                    <p style={{fontWeight:600}}>{guests.length===0?'No guests yet':'No results found'}</p>
                  </td></tr>
                ) : filtered.map((g,i) => (
                  <motion.tr key={g.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}>
                    <td><input type="checkbox" checked={selected.includes(g.id)} onChange={()=>toggleSelect(g.id)}/></td>
                    <td>
                      <div style={{fontWeight:600,color:'var(--text-heading)'}}>{g.name}</div>
                      <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{g.email}</div>
                    </td>
                    <td>
                      <div style={{fontWeight:500,color:'var(--text-primary)'}}>{g.organization}</div>
                      <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{g.designation}</div>
                    </td>
                    <td>
                      <span style={{display:'inline-flex',alignItems:'center',padding:'0.2rem 0.6rem',borderRadius:'99px',fontSize:'0.7rem',fontWeight:600,background:catColors[g.category]||catColors.guest,color:catText[g.category]||catText.guest}}>
                        {g.category}
                      </span>
                    </td>
                    <td style={{fontSize:'0.8rem',color:g.phone?'var(--success)':'var(--text-muted)'}}>{g.phone||'—'}</td>
                    <td style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{new Date(g.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{display:'flex',gap:'0.375rem'}}>
                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>handleEdit(g)} className="btn-secondary" style={{padding:'0.3rem 0.6rem',fontSize:'0.75rem',borderColor:'#22c55e',color:'#22c55e'}}><Edit2 size={12}/> Edit</motion.button>
                        <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} onClick={()=>handleDelete(g)} disabled={loading} className="btn-danger" style={{padding:'0.3rem 0.6rem',fontSize:'0.75rem'}}><Trash2 size={12}/> Del</motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {modal(showForm, resetForm, editing?'Edit Guest':'Add Guest', editing?<Edit2 size={16}/>:<Plus size={16}/>,
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
            <input className="input-field" type="text" placeholder="Full Name *" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} required/>
            <input className="input-field" type="email" placeholder="Email Address *" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} required/>
            <input className="input-field" type="text" placeholder="Organization *" value={formData.organization} onChange={e=>setFormData({...formData,organization:e.target.value})} list="orgs" required/>
            <datalist id="orgs">{organizations.map(o=><option key={o} value={o}/>)}</datalist>
            <input className="input-field" type="text" placeholder="Designation *" value={formData.designation} onChange={e=>setFormData({...formData,designation:e.target.value})} required/>
            <select className="input-field" value={formData.category} onChange={e=>setFormData({...formData,category:e.target.value})}>
              {categories.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
            <input className="input-field" type="tel" placeholder="Phone" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})}/>
            <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} type="submit" disabled={loading} style={{background:'#22c55e',color:'#0a1628',flex:1,justifyContent:'center'}} className="btn-primary">
                {loading?<div className="spinner"/>:<Check size={14}/>} {loading?'Saving...':(editing?'Update':'Add Guest')}
              </motion.button>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} type="button" onClick={resetForm} className="btn-ghost">Cancel</motion.button>
            </div>
          </form>
        )}

        {/* CSV Import Modal */}
        {modal(showImport, ()=>{setShowImport(false);setCsvData('')}, 'Import Guests from CSV', <Upload size={16}/>,
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{background:'var(--bg-input)',borderRadius:'0.5rem',padding:'0.875rem',fontFamily:'monospace',fontSize:'0.75rem',color:'var(--text-muted)',border:'1px solid var(--border-card)'}}>
              name,email,organization,designation,category,phone<br/>
              John Doe,john@microsoft.com,Microsoft,Engineer,industry,98765
            </div>
            <textarea className="input-field" style={{minHeight:'8rem',fontFamily:'monospace',fontSize:'0.8rem',resize:'vertical'}} placeholder="Paste CSV data..." value={csvData} onChange={e=>setCsvData(e.target.value)}/>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={handleCSVImport} disabled={loading||!csvData.trim()} style={{background:'#22c55e',color:'#0a1628',flex:1,justifyContent:'center'}} className="btn-primary">
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
