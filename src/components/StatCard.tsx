'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number | string
  icon: ReactNode
  accentColor?: string
  delay?: number
}

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay, ease: 'easeOut' },
  }),
}

export default function StatCard({ title, value, icon, accentColor = 'var(--accent)', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      custom={delay}
      className="card"
      style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
    >
      {/* Glow accent top strip */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: accentColor,
        opacity: 0.7,
      }} />

      {/* Icon */}
      <div style={{
        position: 'absolute',
        top: '1.25rem',
        right: '1.25rem',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        background: `${accentColor}18`,
        color: accentColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>

      {/* Content */}
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
          {title}
        </p>
        <p style={{ fontSize: '2.25rem', fontWeight: 800, color: accentColor, lineHeight: 1 }}>
          {value}
        </p>
      </div>
    </motion.div>
  )
}
