import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminProtection from '@/components/AdminProtection'
import Navigation from '@/components/Navigation'
import StatCard from '@/components/StatCard'
import { GraduationCap, Send, Mail, Users, BookOpen, BarChart2, Plus, ArrowRight } from 'lucide-react'

export default async function Dashboard() {
  const [totalStudents, totalInvitations, totalEmailsSent, totalGuests, totalProfessors] = await Promise.all([
    prisma.student.count(),
    prisma.invitation.count(),
    prisma.emailLog.count(),
    prisma.guest.count(),
    prisma.professor.count(),
  ])

  const quickActions = [
    { href: '/students',    icon: GraduationCap, label: 'Manage Students',   desc: 'Add, edit, or import student email lists',    color: 'var(--accent)' },
    { href: '/guests',      icon: Users,         label: 'Manage Guests',     desc: 'Handle VIPs, alumni & industry contacts',     color: '#22c55e' },
    { href: '/professors',  icon: BookOpen,      label: 'Manage Professors', desc: 'Academic faculty from institutions',           color: '#a855f7' },
    { href: '/compose',     icon: Send,          label: 'Create Invitation', desc: 'Compose and send event invitations',          color: '#f59e0b' },
    { href: '/invitations', icon: BarChart2,     label: 'View Analytics',   desc: 'Track delivery rates and open rates',         color: '#6366f1' },
    { href: '/email-test',  icon: Mail,          label: 'Email Test',        desc: 'Test your email service connectivity',        color: '#ef4444' },
  ]

  return (
    <AdminProtection>
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navigation />

        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>

          {/* Page Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
              Admin Panel
            </p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '0.375rem' }}>
              Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Welcome back! Here&apos;s an overview of your invitation system.
            </p>
          </div>

          {/* Stat Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
            <StatCard title="Total Students"   value={totalStudents}    icon={<GraduationCap size={18}/>} accentColor="var(--accent)"   delay={0}    />
            <StatCard title="Total Guests"     value={totalGuests}      icon={<Users size={18}/>}         accentColor="#22c55e"          delay={0.08} />
            <StatCard title="Total Professors" value={totalProfessors}  icon={<BookOpen size={18}/>}      accentColor="#a855f7"          delay={0.16} />
            <StatCard title="Invitations Sent" value={totalInvitations} icon={<Send size={18}/>}          accentColor="#f59e0b"          delay={0.24} />
            <StatCard title="Emails Sent"      value={totalEmailsSent}  icon={<Mail size={18}/>}          accentColor="#6366f1"          delay={0.32} />
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>Quick Actions</h2>
            <Link href="/compose" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
              <Plus size={14} /> New Invitation
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="card"
                    style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                  >
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '0.625rem',
                      background: `${action.color}18`,
                      color: action.color,
                      flexShrink: 0,
                    }}>
                      <Icon size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.15rem' }}>{action.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{action.desc}</p>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </AdminProtection>
  )
}
