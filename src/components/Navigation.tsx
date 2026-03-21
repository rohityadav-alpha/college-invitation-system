'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, LayoutDashboard, GraduationCap, Users, BookOpen,
  Send, BarChart2, Rocket, Menu, X
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { name: 'Home',       href: '/',            icon: Home },
  { name: 'Dashboard',  href: '/dashboard',   icon: LayoutDashboard },
  { name: 'Students',   href: '/students',    icon: GraduationCap },
  { name: 'Guests',     href: '/guests',      icon: Users },
  { name: 'Professors', href: '/professors',  icon: BookOpen },
  { name: 'Compose',    href: '/compose',     icon: Send },
  { name: 'Analytics',  href: '/invitations', icon: BarChart2 },
]

export default function Navigation() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <nav style={{
      background: 'var(--bg-nav)',
      borderBottom: '1px solid var(--border-card)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{
              padding: '0.5rem',
              background: 'var(--accent)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Rocket size={18} style={{ color: '#0a1628' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-heading)' }}>
              InviteSystem
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-link${isActive ? ' active' : ''}`}
                  style={{ fontSize: '0.8rem' }}
                >
                  <Icon size={14} />
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-line"
                      style={{
                        position: 'absolute',
                        bottom: -1,
                        left: '20%',
                        right: '20%',
                        height: '2px',
                        background: 'var(--accent)',
                        borderRadius: '99px',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle />

            {/* Mobile hamburger */}
            <motion.button
              className="md:hidden"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
              }}
            >
              {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ overflow: 'hidden', borderTop: '1px solid var(--border-card)' }}
            >
              <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {navItems.map((item, i) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`nav-link${isActive ? ' active' : ''}`}
                        style={{ width: '100%' }}
                      >
                        <Icon size={16} />
                        {item.name}
                        {isActive && (
                          <div style={{
                            marginLeft: 'auto',
                            width: '0.4rem',
                            height: '0.4rem',
                            background: 'var(--accent)',
                            borderRadius: '50%',
                          }} />
                        )}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
