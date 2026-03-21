'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import StatusBadge from '@/components/StatusBadge'
import { motion } from 'framer-motion'
import { BarChart2, Send, Mail, MessageSquare, Phone, Search, X, RefreshCw, Eye, ChevronRight } from 'lucide-react'

interface Invitation {
  id: string; title: string; status: string; type: string; createdAt: string
  _count?: { emailLogs: number; smsLogs: number; whatsappLogs: number }
  emailLogs?: Array<{status:string}>
  whatsappLogs?: Array<{status:string}>
  smsLogs?: Array<{status:string}>
}

const pageVariants = { initial:{opacity:0,y:20}, animate:{opacity:1,y:0,transition:{duration:0.3,ease:'easeOut' as const}} }

const chanMap: Record<string,{icon:React.ReactNode,color:string}> = {
  email:     {icon:<Mail size={14}/>,     color:'var(--accent)'},
  whatsapp:  {icon:<MessageSquare size={14}/>, color:'#22c55e'},
  sms:       {icon:<Phone size={14}/>,    color:'#f59e0b'},
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [filtered, setFiltered] = useState<Invitation[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => { fetchInvitations() }, [])
  useEffect(() => {
    let f = invitations
    if (search) f = f.filter(inv => inv.title.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter) f = f.filter(inv => inv.type === typeFilter)
    setFiltered(f)
  }, [invitations, search, typeFilter])

  const fetchInvitations = async () => {
    setLoading(true)
    try { const r = await fetch('/api/invitations'); setInvitations(await r.json()) } catch {}
    setLoading(false)
  }

  const handleRetryFailed = async () => {
    setRetrying(true)
    try {
      const r = await fetch('/api/retry-failed', { method: 'POST' })
      const result = await r.json()
      alert(r.ok ? `✅ ${result.message}` : `❌ ${result.error}`)
      if (r.ok) fetchInvitations()
    } catch { alert('❌ Network error') }
    setRetrying(false)
  }

  const totalEmails = invitations.reduce((acc, inv) => acc + (inv._count?.emailLogs || 0), 0)
  const totalWA = invitations.reduce((acc, inv) => acc + (inv._count?.whatsappLogs || 0), 0)
  const totalSMS = invitations.reduce((acc, inv) => acc + (inv._count?.smsLogs || 0), 0)

  const getTypeChip = (type: string) => {
    const t = chanMap[type]
    if (!t) return null
    return (
      <span style={{display:'inline-flex',alignItems:'center',gap:'0.25rem',padding:'0.2rem 0.55rem',borderRadius:'99px',fontSize:'0.7rem',fontWeight:600,background:`${t.color}18`,color:t.color}}>
        {t.icon} {type}
      </span>
    )
  }

  return (
    <AdminProtection>
      <motion.div variants={pageVariants} initial="initial" animate="animate" style={{minHeight:'100vh',background:'var(--bg-primary)'}}>
        <Navigation/>
        <div style={{maxWidth:'80rem',margin:'0 auto',padding:'2rem 1.5rem'}}>

          {/* Header */}
          <div style={{display:'flex',flexWrap:'wrap',alignItems:'flex-start',justifyContent:'space-between',gap:'1rem',marginBottom:'2rem'}}>
            <div>
              <p style={{fontSize:'0.7rem',color:'var(--accent)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.35rem'}}>Admin Panel</p>
              <h1 style={{fontSize:'clamp(1.4rem,3vw,2rem)',fontWeight:800,color:'var(--text-heading)'}}>Invitation Analytics</h1>
              <p style={{color:'var(--text-muted)',fontSize:'0.85rem'}}>All sent invitations and their delivery status</p>
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={handleRetryFailed} disabled={retrying} className="btn-secondary">
                <RefreshCw size={14} style={{animation:retrying?'spin 0.6s linear infinite':undefined}}/> Retry Failed
              </motion.button>
              <Link href="/compose">
                <motion.div whileHover={{scale:1.03}} whileTap={{scale:0.97}} className="btn-primary" style={{display:'inline-flex'}}>
                  <Send size={14}/> New Invitation
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Stats overview */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'1rem',marginBottom:'2rem'}}>
            {[
              {label:'Total Invitations',value:invitations.length,color:'var(--accent)',icon:<BarChart2 size={18}/>},
              {label:'Emails Sent',value:totalEmails,color:'var(--accent)',icon:<Mail size={18}/>},
              {label:'WhatsApp Sent',value:totalWA,color:'#22c55e',icon:<MessageSquare size={18}/>},
              {label:'SMS Sent',value:totalSMS,color:'#f59e0b',icon:<Phone size={18}/>},
            ].map((s,i) => (
              <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}} className="card" style={{padding:'1.25rem',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',background:s.color,opacity:0.7}}/>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                  <p style={{fontSize:'0.7rem',color:'var(--text-muted)',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em'}}>{s.label}</p>
                  <div style={{padding:'0.375rem',background:`${s.color}18`,borderRadius:'0.4rem',color:s.color}}>{s.icon}</div>
                </div>
                <p style={{fontSize:'2rem',fontWeight:800,color:s.color,lineHeight:1}}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="card-plain" style={{padding:'1.25rem',marginBottom:'1.5rem',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0.75rem'}}>
            <div style={{position:'relative'}}>
              <Search size={14} style={{position:'absolute',left:'0.75rem',top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
              <input className="input-field" style={{paddingLeft:'2.25rem'}} type="text" placeholder="Search invitations..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="input-field" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
              <option value="">All Channels</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>
            <button className="btn-ghost" onClick={()=>{setSearch('');setTypeFilter('')}}><X size={14}/> Clear</button>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{textAlign:'center',padding:'4rem',color:'var(--text-muted)'}}>
              <div className="spinner" style={{margin:'0 auto 1rem'}}/>
              <p>Loading invitations...</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Title</th><th>Channel</th><th>Messages</th><th>Status</th><th>Created</th><th>View</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0 ? (
                    <tr><td colSpan={7} style={{textAlign:'center',padding:'3rem',color:'var(--text-muted)'}}>
                      <BarChart2 size={40} style={{margin:'0 auto 0.75rem',opacity:0.3}}/>
                      <p style={{fontWeight:600}}>{invitations.length===0?'No invitations sent yet':'No results found'}</p>
                      {invitations.length===0&&(<Link href="/compose" style={{color:'var(--accent)',fontWeight:600,display:'inline-flex',alignItems:'center',gap:'0.25rem',marginTop:'0.5rem'}}>Create your first invitation <ChevronRight size={14}/></Link>)}
                    </td></tr>
                  ) : filtered.map((inv,i) => {
                    const totalMsgs = (inv._count?.emailLogs||0)+(inv._count?.whatsappLogs||0)+(inv._count?.smsLogs||0)
                    return (
                      <motion.tr key={inv.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.025}}>
                        <td style={{fontWeight:700,color:'var(--text-muted)',fontSize:'0.8rem'}}>{i+1}</td>
                        <td>
                          <div style={{fontWeight:600,color:'var(--text-heading)'}}>{inv.title}</div>
                          <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>ID: {inv.id.slice(-8)}</div>
                        </td>
                        <td>{getTypeChip(inv.type)}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:'0.75rem',fontSize:'0.8rem'}}>
                            {(inv._count?.emailLogs||0)>0&&<span style={{color:'var(--accent)'}}><Mail size={12} style={{display:'inline',marginRight:'0.2rem'}}/>{inv._count?.emailLogs}</span>}
                            {(inv._count?.whatsappLogs||0)>0&&<span style={{color:'#22c55e'}}><MessageSquare size={12} style={{display:'inline',marginRight:'0.2rem'}}/>{inv._count?.whatsappLogs}</span>}
                            {(inv._count?.smsLogs||0)>0&&<span style={{color:'#f59e0b'}}><Phone size={12} style={{display:'inline',marginRight:'0.2rem'}}/>{inv._count?.smsLogs}</span>}
                            {totalMsgs===0&&<span style={{color:'var(--text-muted)'}}>—</span>}
                          </div>
                        </td>
                        <td><StatusBadge status={inv.status}/></td>
                        <td style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link href={`/invitations/${inv.id}`}>
                            <motion.div whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="btn-secondary" style={{padding:'0.3rem 0.6rem',fontSize:'0.75rem',display:'inline-flex',gap:'0.25rem',alignItems:'center'}}>
                              <Eye size={12}/> View
                            </motion.div>
                          </Link>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </AdminProtection>
  )
}
