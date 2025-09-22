'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import Link from 'next/link'
import { AppIcons } from '@/components/icons/AppIcons'

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-gray-600">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <AppIcons.MenuVertical size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Email History & Analytics</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Track and analyze your invitation campaigns</p>
            </div>
          </div>
          
          <Link
            href="/compose"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all font-medium flex items-center gap-2"
          >
            <AppIcons.Send size={16} />
            <span className="text-sm sm:text-base">Create New Invitation</span>
          </Link>
        </div>

        {invitations.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                <AppIcons.Info size={48} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">No Invitations Yet</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">Start by creating your first invitation to see analytics here</p>
            <Link
              href="/compose"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all font-medium inline-flex items-center gap-2"
            >
              <AppIcons.Send size={18} />
              <span>Create Invitation</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 hover:shadow-xl transition-all duration-300">
                {/* Enhanced Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-6 sm:mb-8">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl">
                      <AppIcons.Email size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{invitation.title}</h3>
                      <p className="text-sm sm:text-base text-gray-700 mb-2">{invitation.subject}</p>
                      <p className="text-xs sm:text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
                        Created: {new Date(invitation.createdAt).toLocaleDateString()} at {new Date(invitation.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200">
                    <p className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                      <span className="text-blue-600">{invitation.analytics.totalSent}</span> emails sent
                    </p>
                    {invitation.analytics.failed > 0 && (
                      <button
                        onClick={() => retryFailedEmails(invitation.id)}
                        disabled={retryingId === invitation.id}
                        className="text-xs sm:text-sm bg-gradient-to-r from-red-100 to-red-200 text-red-700 px-3 py-1.5 sm:py-2 rounded-lg hover:from-red-200 hover:to-red-300 disabled:opacity-50 transition-all font-medium shadow-md flex items-center gap-1 sm:gap-2"
                      >
                        {retryingId === invitation.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-600 border-t-transparent"></div>
                        ) : (
                          <AppIcons.Refresh size={14} />
                        )}
                        <span>{retryingId === invitation.id ? 'Retrying...' : `Retry ${invitation.analytics.failed} Failed`}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Enhanced Analytics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl border-2 border-blue-200 text-center hover:shadow-lg transition-all duration-200">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1">{invitation.analytics.totalSent}</p>
                    <p className="text-xs sm:text-sm font-medium text-blue-700">Total Sent</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-4 rounded-xl border-2 border-green-200 text-center hover:shadow-lg transition-all duration-200">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1">{invitation.analytics.delivered}</p>
                    <p className="text-xs sm:text-sm font-medium text-green-700">Delivered</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 rounded-xl border-2 border-purple-200 text-center hover:shadow-lg transition-all duration-200">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1">{invitation.analytics.opened}</p>
                    <p className="text-xs sm:text-sm font-medium text-purple-700">Opened</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3 sm:p-4 rounded-xl border-2 border-indigo-200 text-center hover:shadow-lg transition-all duration-200">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 mb-1">{invitation.analytics.clicked}</p>
                    <p className="text-xs sm:text-sm font-medium text-indigo-700">Clicked</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 sm:p-4 rounded-xl border-2 border-red-200 text-center hover:shadow-lg transition-all duration-200">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-1">{invitation.analytics.failed}</p>
                    <p className="text-xs sm:text-sm font-medium text-red-700">Failed</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 sm:p-4 rounded-xl border-2 border-yellow-200 text-center hover:shadow-lg transition-all duration-200">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-1">{invitation.analytics.pending}</p>
                    <p className="text-xs sm:text-sm font-medium text-yellow-700">Pending</p>
                  </div>
                </div>

                {/* Enhanced Rates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <AppIcons.Check size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-medium text-gray-600">Delivery Rate</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{invitation.analytics.deliveryRate}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <AppIcons.Preview size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-medium text-gray-600">Open Rate</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{invitation.analytics.openRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Email Logs Summary */}
                <div className="border-t-2 border-gray-200 pt-4 sm:pt-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <AppIcons.List size={18} className="text-indigo-600" />
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">Recent Email Status</h4>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {invitation.emailLogs.slice(0, 10).map((log) => {
                        const recipientInfo = getRecipientInfo(log)
                        return (
                          <span
                            key={log.id}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border-2 transition-all hover:shadow-md ${getStatusColor(log.status)}`}
                            title={`${recipientInfo.name} (${recipientInfo.email}) - ${log.status} - ${recipientInfo.type}`}
                          >
                            <span className="font-semibold">{recipientInfo.name}</span>
                            <span className="mx-1 opacity-60">-</span>
                            <span>{log.status}</span>
                          </span>
                        )
                      })}
                      {invitation.emailLogs.length > 10 && (
                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 border-2 border-gray-400">
                          +{invitation.emailLogs.length - 10} more recipients
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced View Details Link */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 border-2 border-indigo-200">
                  <Link
                    href={`/invitations/${invitation.id}`}
                    className="flex items-center justify-between group hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 rounded-lg p-3 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                        <AppIcons.Preview size={16} className="text-indigo-600" />
                      </div>
                      <span className="text-sm sm:text-base font-semibold text-indigo-600 group-hover:text-indigo-800">
                        View Detailed Analytics
                      </span>
                    </div>
                    <AppIcons.ArrowRight size={16} className="text-indigo-600 group-hover:text-indigo-800 group-hover:translate-x-1 transition-all" />
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
