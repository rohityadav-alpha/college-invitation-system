'use client'

interface StatusBadgeProps {
  status: string
}

const statusMap: Record<string, { label: string; className: string }> = {
  sent:      { label: 'Sent',      className: 'badge badge-sent' },
  delivered: { label: 'Delivered', className: 'badge badge-delivered' },
  opened:    { label: 'Opened',    className: 'badge badge-opened' },
  clicked:   { label: 'Clicked',   className: 'badge badge-clicked' },
  failed:    { label: 'Failed',    className: 'badge badge-failed' },
  pending:   { label: 'Pending',   className: 'badge badge-pending' },
  read:      { label: 'Read',      className: 'badge badge-read' },
}

const dotColors: Record<string, string> = {
  sent:      '#00d4ff',
  delivered: '#22c55e',
  opened:    '#a855f7',
  clicked:   '#6366f1',
  failed:    '#ef4444',
  pending:   '#f59e0b',
  read:      '#22c55e',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = statusMap[status] || { label: status, className: 'badge badge-pending' }
  const dot = dotColors[status] || '#6b8cae'
  return (
    <span className={s.className}>
      <span style={{ width: '0.4rem', height: '0.4rem', borderRadius: '50%', background: dot, display: 'inline-block' }} />
      {s.label}
    </span>
  )
}
