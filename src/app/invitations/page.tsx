'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import Link from 'next/link'

interface EmailLog {
  id: string
  status: string
  sentAt: string
  recipientType?: string  // Optional - for old records
  student?: {
    name: string
    email: string
    course: string
    year: string
  }
  guest?: {
    name: string
    email: string
    organization: string
    designation: string
  }
  professor?: {
    name: string
    email: string
    college: string
    department: string
  }
}

interface Invitation {
  id: string
  title: string
  subject: string
  createdAt: string
  sentCount: number
  emailLogs: EmailLog[]
  analytics: {
    totalSent: number
    delivered: number
    opened: number
    clicked: number
    failed: number
    pending: number
    deliveryRate: string
    openRate: string
  }
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [retryingId, setRetryingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations')
      const data = await response.json()
      setInvitations(data)
    } catch (error) {
      console.error('Error fetching invitations:', error)
    } finally {
      setLoading(false)
    }
  }

  const retryFailedEmails = async (invitationId: string) => {
    setRetryingId(invitationId)
    try {
      const response = await fetch('/api/retry-failed-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId })
      })

      const result = await response.json()
      
      if (response.ok) {
        alert(`✅ ${result.message}`)
        fetchInvitations() // Refresh data
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Network error occurred')
    } finally {
      setRetryingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'opened': return 'text-blue-600 bg-blue-100'
      case 'clicked': return 'text-purple-600 bg-purple-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'sent': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Safe function to get recipient info from log
  const getRecipientInfo = (log: EmailLog) => {
    // Check for student first (backward compatibility)
    if (log.student) {
      return {
        name: log.student.name,
        email: log.student.email,
        type: 'Student',
        details: `${log.student.course} - ${log.student.year}`
      }
    }
    
    // Check for guest
    if (log.guest) {
      return {
        name: log.guest.name,
        email: log.guest.email,
        type: 'Guest',
        details: `${log.guest.organization} - ${log.guest.designation}`
      }
    }
    
    // Check for professor
    if (log.professor) {
      return {
        name: log.professor.name,
        email: log.professor.email,
        type: 'Professor',
        details: `${log.professor.college} - ${log.professor.department}`
      }
    }
    
    // Fallback for old/corrupted records
    return {
      name: 'Unknown Recipient',
      email: 'unknown@email.com',
      type: log.recipientType || 'Student',
      details: 'No details available'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading invitations...</div>
        </div>
      </div>
    )
  }

  return (
    <AdminProtection>
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Email History & Analytics</h1>
          <Link
            href="/compose"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create New Invitation
          </Link>
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Invitations Yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first invitation</p>
            <Link
              href="/compose"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Invitation
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{invitation.title}</h3>
                    <p className="text-sm text-gray-600">{invitation.subject}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(invitation.createdAt).toLocaleDateString()} at {new Date(invitation.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {invitation.analytics.totalSent} emails sent
                    </p>
                    {invitation.analytics.failed > 0 && (
                      <button
                        onClick={() => retryFailedEmails(invitation.id)}
                        disabled={retryingId === invitation.id}
                        className="mt-2 text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 disabled:opacity-50"
                      >
                        {retryingId === invitation.id ? 'Retrying...' : `Retry ${invitation.analytics.failed} Failed`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{invitation.analytics.totalSent}</p>
                    <p className="text-xs text-blue-700">Total Sent</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{invitation.analytics.delivered}</p>
                    <p className="text-xs text-green-700">Delivered</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{invitation.analytics.opened}</p>
                    <p className="text-xs text-purple-700">Opened</p>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-indigo-600">{invitation.analytics.clicked}</p>
                    <p className="text-xs text-indigo-700">Clicked</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">{invitation.analytics.failed}</p>
                    <p className="text-xs text-red-700">Failed</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-600">{invitation.analytics.pending}</p>
                    <p className="text-xs text-yellow-700">Pending</p>
                  </div>
                </div>

                {/* Rates */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Delivery Rate</p>
                    <p className="text-xl font-bold text-gray-900">{invitation.analytics.deliveryRate}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Open Rate</p>
                    <p className="text-xl font-bold text-gray-900">{invitation.analytics.openRate}%</p>
                  </div>
                </div>

                {/* Email Logs Summary - FIXED */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Email Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {invitation.emailLogs.slice(0, 10).map((log) => {
                      const recipientInfo = getRecipientInfo(log)
                      return (
                        <span
                          key={log.id}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}
                          title={`${recipientInfo.name} (${recipientInfo.email}) - ${log.status} - ${recipientInfo.type}`}
                        >
                          {recipientInfo.name} - {log.status}
                        </span>
                      )
                    })}
                    {invitation.emailLogs.length > 10 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{invitation.emailLogs.length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                {/* View Details Link */}
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href={`/invitations/${invitation.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Detailed Analytics →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AdminProtection>
  )
}
