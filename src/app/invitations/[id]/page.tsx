// src/app/invitations/[id]/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import StatusBadge from '@/components/StatusBadge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Edit2, Trash2, RefreshCw, Mail, CheckCircle,
  Eye, MousePointer, XCircle, Clock, X, Check, Send
} from 'lucide-react'

interface EmailLog {
  id: string; status: string; sentAt: string; deliveredAt?: string; openedAt?: string; clickedAt?: string; errorMessage?: string; messageId?: string; recipientType?: string
  student?: { id:string; name:string; email:string; course:string; year:string }
  guest?: { id:string; name:string; email:string; organization:string; designation:string }
  professor?: { id:string; name:string; email:string; college:string; department:string }
}

interface InvitationDetail {
  id: string; title: string; subject: string; content: string; createdAt: string; sentCount: number; emailLogs: EmailLog[]
}

const pageVariants = { initial:{opacity:0,y:20}, animate:{opacity:1,y:0,transition:{duration:0.3,ease:'easeOut' as const}} }

export default function InvitationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [retrying, setRetrying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editForm, setEditForm] = useState({ title:'',subject:'',content:'' })

  useEffect(() => { if (params.id) fetchInvitation() }, [params.id])

  const fetchInvitation = async () => {
    try {
      setLoading(true)
      const r = await fetch(`/api/invitations/${params.id}`)
      if (r.ok) { const data = await r.json(); setInvitation(data); setEditForm({title:data.title||'',subject:data.subject||'',content:data.content||''}) }
    } catch {}
    setLoading(false)
  }

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()||!editForm.subject.trim()||!editForm.content.trim()) { alert('Please fill all fields'); return }
    try {
      setIsEditing(false)
      const r = await fetch(`/api/invitations/${params.id}`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(editForm)})
      if (r.ok) { const updated = await r.json(); setInvitation(p=>p?{...p,...updated}:null); alert('✅ Invitation updated!') }
      else { const err = await r.json(); alert(`❌ ${err.error}`); setIsEditing(true) }
    } catch { alert('❌ Error updating'); setIsEditing(true) }
  }

  const handleCancelEdit = () => { if (invitation) setEditForm({title:invitation.title,subject:invitation.subject,content:invitation.content}); setIsEditing(false) }

  const handleDelete = async () => {
    if (!confirm('Delete this invitation? Cannot be undone.')) return
    try {
      setIsDeleting(true)
      const r = await fetch(`/api/invitations/${params.id}`, {method:'DELETE'})
      if (r.ok) { alert('✅ Invitation deleted!'); router.push('/invitations') }
      else { const err = await r.json(); alert(`❌ ${err.error}`) }
    } catch { alert('❌ Error deleting') }
    setIsDeleting(false)
  }

  const retryFailed = async () => {
    setRetrying(true)
    setTimeout(() => { setRetrying(false); alert('Failed messages retried!'); fetchInvitation() }, 2000)
  }

  const getRecipient = (log: EmailLog) => {
    if (log.student) return { name:log.student.name, email:log.student.email, type:'Student', details:`${log.student.course} · ${log.student.year}` }
    if (log.guest)   return { name:log.guest.name,   email:log.guest.email,   type:'Guest',   details:`${log.guest.organization} · ${log.guest.designation}` }
    if (log.professor) return { name:log.professor.name, email:log.professor.email, type:'Professor', details:`${log.professor.college} · ${log.professor.department}` }
    return { name:'Unknown', email:'N/A', type:'Unknown', details:'No details' }
  }

  const filteredLogs = invitation ? invitation.emailLogs.filter(l => statusFilter==='all'||l.status===statusFilter) : []

  const stats = invitation ? {
    total:     invitation.emailLogs.length,
    sent:      invitation.emailLogs.filter(l=>l.status==='sent').length,
    delivered: invitation.emailLogs.filter(l=>l.status==='delivered').length,
    opened:    invitation.emailLogs.filter(l=>l.status==='opened').length,
    clicked:   invitation.emailLogs.filter(l=>l.status==='clicked').length,
    failed:    invitation.emailLogs.filter(l=>l.status==='failed').length,
  } : {total:0,sent:0,delivered:0,opened:0,clicked:0,failed:0}

  const typeColor: Record<string,string> = { Student:'var(--accent)', Guest:'#22c55e', Professor:'#a855f7' }

  if (loading) return (
    <AdminProtection>
      <div style={{minHeight:'100vh',background:'var(--bg-primary)'}}>
        <Navigation/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:'1rem'}}>
          <div className="spinner" style={{width:'2.5rem',height:'2.5rem'}}/>
          <p style={{color:'var(--text-muted)'}}>Loading invitation...</p>
        </div>
      </div>
    </AdminProtection>
  )

  if (!invitation) return (
    <AdminProtection>
      <div style={{minHeight:'100vh',background:'var(--bg-primary)'}}>
        <Navigation/>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:'1rem'}}>
          <div style={{fontSize:'3rem'}}>📭</div>
          <h2 style={{fontSize:'1.5rem',fontWeight:700,color:'var(--text-heading)'}}>Invitation Not Found</h2>
          <Link href="/invitations" className="btn-primary" style={{display:'inline-flex',alignItems:'center',gap:'0.4rem'}}>
            <ArrowLeft size={14}/> Back to Invitations
          </Link>
        </div>
      </div>
    </AdminProtection>
  )

  return (
    <AdminProtection>
      <motion.div variants={pageVariants} initial="initial" animate="animate" style={{minHeight:'100vh',background:'var(--bg-primary)'}}>
        <Navigation/>
        <div style={{maxWidth:'72rem',margin:'0 auto',padding:'2rem 1.5rem'}}>

          {/* Back + header */}
          <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:'1rem',marginBottom:'2rem'}}>
            <Link href="/invitations" style={{display:'inline-flex',alignItems:'center',gap:'0.4rem',fontSize:'0.85rem',fontWeight:600,color:'var(--accent)',textDecoration:'none'}}>
              <ArrowLeft size={14}/> All Invitations
            </Link>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={retryFailed} disabled={retrying||stats.failed===0} className="btn-secondary">
                <RefreshCw size={14} style={{animation:retrying?'spin 0.6s linear infinite':undefined}}/> Retry Failed {stats.failed>0&&`(${stats.failed})`}
              </motion.button>
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={()=>setIsEditing(true)} className="btn-ghost">
                <Edit2 size={14}/> Edit
              </motion.button>
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={handleDelete} disabled={isDeleting} className="btn-danger">
                <Trash2 size={14}/> {isDeleting?'Deleting...':'Delete'}
              </motion.button>
            </div>
          </div>

          {/* Title + Meta */}
          <div className="card-plain" style={{padding:'1.75rem',marginBottom:'1.5rem',borderLeft:'3px solid var(--accent)'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap'}}>
              <div style={{flex:1}}>
                <p style={{fontSize:'0.7rem',color:'var(--accent)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.35rem'}}>Invitation Details</p>
                <h1 style={{fontSize:'clamp(1.2rem,3vw,1.75rem)',fontWeight:800,color:'var(--text-heading)',marginBottom:'0.5rem'}}>{invitation.title}</h1>
                <p style={{fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'0.25rem'}}><strong>Subject:</strong> {invitation.subject}</p>
                <p style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>Created: {new Date(invitation.createdAt).toLocaleString()} · ID: <code style={{color:'var(--accent)'}}>{invitation.id.slice(-12)}</code></p>
              </div>
              <div style={{padding:'0.75rem',borderRadius:'0.625rem',background:'var(--accent-glow)',color:'var(--accent)'}}>
                <Send size={22}/>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:'0.875rem',marginBottom:'1.75rem'}}>
            {[
              {label:'Total',value:stats.total,color:'var(--accent)',icon:<Mail size={16}/>},
              {label:'Sent',value:stats.sent,color:'var(--accent)',icon:<Send size={16}/>},
              {label:'Delivered',value:stats.delivered,color:'#22c55e',icon:<CheckCircle size={16}/>},
              {label:'Opened',value:stats.opened,color:'#a855f7',icon:<Eye size={16}/>},
              {label:'Clicked',value:stats.clicked,color:'#6366f1',icon:<MousePointer size={16}/>},
              {label:'Failed',value:stats.failed,color:'#ef4444',icon:<XCircle size={16}/>},
            ].map((s,i)=>(
              <motion.div key={s.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}} className="card" style={{padding:'1rem',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:s.color,opacity:0.6}}/>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <p style={{fontSize:'0.65rem',color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s.label}</p>
                  <div style={{color:s.color,opacity:0.7}}>{s.icon}</div>
                </div>
                <p style={{fontSize:'1.75rem',fontWeight:800,color:s.color,lineHeight:1,marginTop:'0.375rem'}}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Content Preview */}
          <div className="card-plain" style={{padding:'1.5rem',marginBottom:'1.75rem'}}>
            <p style={{fontSize:'0.7rem',color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.75rem'}}>Message Content</p>
            <div style={{background:'var(--bg-input)',borderRadius:'0.625rem',padding:'1rem',border:'1px solid var(--border-card)',whiteSpace:'pre-wrap',fontSize:'0.875rem',lineHeight:1.6,color:'var(--text-primary)',maxHeight:'12rem',overflowY:'auto'}}>
              {invitation.content}
            </div>
          </div>

          {/* Logs Table */}
          <div className="card-plain" style={{overflow:'hidden'}}>
            <div className="section-header">
              <Mail size={18} style={{color:'var(--accent)'}}/>
              <h2>Delivery Logs <span style={{fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:400}}>({filteredLogs.length} of {stats.total})</span></h2>
              <div style={{marginLeft:'auto',display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                {['all','sent','delivered','opened','clicked','failed'].map(s=>(
                  <button key={s} onClick={()=>setStatusFilter(s)} style={{
                    padding:'0.25rem 0.625rem',borderRadius:'0.375rem',fontSize:'0.7rem',fontWeight:600,cursor:'pointer',
                    border:`1px solid ${statusFilter===s?'var(--accent)':'var(--border-card)'}`,
                    background:statusFilter===s?'var(--accent-glow)':'transparent',
                    color:statusFilter===s?'var(--accent)':'var(--text-muted)',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <div className="table-wrapper" style={{borderRadius:0,border:'none'}}>
              <table className="data-table">
                <thead>
                  <tr><th>#</th><th>Recipient</th><th>Type</th><th>Status</th><th>Sent At</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {filteredLogs.length===0 ? (
                    <tr><td colSpan={6} style={{textAlign:'center',padding:'2.5rem',color:'var(--text-muted)'}}>
                      <Clock size={32} style={{margin:'0 auto 0.5rem',opacity:0.4}}/><p>No logs match this filter</p>
                    </td></tr>
                  ) : filteredLogs.map((log,i)=>{
                    const rec = getRecipient(log)
                    return (
                      <motion.tr key={log.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}>
                        <td style={{fontWeight:700,color:'var(--text-muted)',fontSize:'0.8rem'}}>{i+1}</td>
                        <td>
                          <div style={{fontWeight:600,color:'var(--text-heading)'}}>{rec.name}</div>
                          <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{rec.email}</div>
                          <div style={{fontSize:'0.68rem',color:'var(--text-muted)',marginTop:'0.1rem'}}>{rec.details}</div>
                        </td>
                        <td>
                          <span style={{display:'inline-flex',padding:'0.2rem 0.55rem',borderRadius:'99px',fontSize:'0.68rem',fontWeight:600,background:`${typeColor[rec.type]||'var(--accent)'}18`,color:typeColor[rec.type]||'var(--accent)'}}>
                            {rec.type}
                          </span>
                        </td>
                        <td><StatusBadge status={log.status}/></td>
                        <td style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{new Date(log.sentAt).toLocaleString()}</td>
                        <td style={{fontSize:'0.72rem',color:'var(--text-muted)',maxWidth:'12rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                          {log.errorMessage ? <span style={{color:'var(--error)'}}>⚠ {log.errorMessage}</span> : '—'}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="modal-overlay">
              <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} transition={{duration:0.25}} className="card-plain"
                style={{width:'100%',maxWidth:'36rem',padding:'2rem',maxHeight:'90vh',overflowY:'auto',border:'1px solid var(--border)'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
                    <div style={{padding:'0.5rem',background:'var(--accent-glow)',borderRadius:'0.5rem',color:'var(--accent)'}}><Edit2 size={16}/></div>
                    <h2 style={{fontSize:'1.1rem',fontWeight:700,color:'var(--text-heading)'}}>Edit Invitation</h2>
                  </div>
                  <button onClick={handleCancelEdit} className="btn-ghost" style={{padding:'0.25rem'}}><X size={16}/></button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                  <div>
                    <label style={{fontSize:'0.8rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:'0.4rem'}}>Title</label>
                    <input className="input-field" value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})} placeholder="Invitation title"/>
                  </div>
                  <div>
                    <label style={{fontSize:'0.8rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:'0.4rem'}}>Subject</label>
                    <input className="input-field" value={editForm.subject} onChange={e=>setEditForm({...editForm,subject:e.target.value})} placeholder="Email subject"/>
                  </div>
                  <div>
                    <label style={{fontSize:'0.8rem',fontWeight:600,color:'var(--text-muted)',display:'block',marginBottom:'0.4rem'}}>Content</label>
                    <textarea className="input-field" value={editForm.content} onChange={e=>setEditForm({...editForm,content:e.target.value})} rows={8} placeholder="Message body" style={{resize:'vertical'}}/>
                  </div>
                  <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem'}}>
                    <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={handleSaveEdit} className="btn-primary" style={{flex:1,justifyContent:'center'}}>
                      <Check size={14}/> Save Changes
                    </motion.button>
                    <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={handleCancelEdit} className="btn-ghost">Cancel</motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AdminProtection>
  )
}
