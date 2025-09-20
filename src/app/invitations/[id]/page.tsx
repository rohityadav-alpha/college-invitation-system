'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import AdminProtection from '@/components/AdminProtection'
import { AppIcons } from '@/components/icons/AppIcons'
import Link from 'next/link'

interface EmailLog {
  id: string
  status: string
  sentAt: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  errorMessage?: string
  messageId?: string
  recipientType?: string
  student?: {
    id: string
    name: string
    email: string
    course: string
    year: string
  }
  guest?: {
    id: string
    name: string
    email: string
    organization: string
    designation: string
  }
  professor?: {
    id: string
    name: string
    email: string
    college: string
    department: string
  }
}

interface InvitationDetail {
  id: string
  title: string
  subject: string
  content: string
  createdAt: string
  sentCount: number
  emailLogs: EmailLog[]
}

export default function InvitationDetailPage() {
  const params = useParams()
  const [invitation, setInvitation] = useState<InvitationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (params.id) {
      fetchInvitationDetail(params.id as string)
    }
  }, [params.id])

  const fetchInvitationDetail = async (id: string) => {
    try {
      const response = await fetch(`/api/invitations/${id}`)
      const data = await response.json()
      setInvitation(data)
    } catch (error) {
      console.error('Error fetching invitation detail:', error)
    } finally {
      setLoading(false)
    }
  }

  // Safe function to get recipient info
  const getRecipientInfo = (log: EmailLog) => {
    // Check for student first (backward compatibility)
    if (log.student) {
      return {
        name: log.student.name,
        email: log.student.email,
        type: 'Student',
        details: `${log.student.course} - ${log.student.year}`,
        icon: <AppIcons.Students className="h-5 w-5 text-blue-500" />
      }
    }
    
    // Check for guest
    if (log.guest) {
      return {
        name: log.guest.name,
        email: log.guest.email,
        type: 'Guest',
        details: `${log.guest.organization} - ${log.guest.designation}`,
        icon: <AppIcons.Guests className="h-5 w-5 text-green-500" />
      }
    }
    
    // Check for professor
    if (log.professor) {
      return {
        name: log.professor.name,
        email: log.professor.email,
        type: 'Professor',
        details: `${log.professor.college} - ${log.professor.department}`,
        icon: <AppIcons.Professors className="h-5 w-5 text-purple-500" />
      }
    }
    
    // Fallback for old/corrupted records
    return {
      name: 'Unknown Recipient',
      email: 'unknown@email.com',
      type: log.recipientType || 'Student',
      details: 'No details available',
      icon: <AppIcons.Calendar className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'opened': return 'bg-blue-100 text-blue-800'
      case 'clicked': return 'bg-purple-100 text-purple-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'sent': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <AppIcons.Check className="h-5 w-5 text-green-500" />
      case 'opened': return <AppIcons.Preview className="h-5 w-5 text-blue-500" />
      case 'clicked': return <AppIcons.Link className="h-5 w-5 text-purple-500" />
      case 'failed': return <AppIcons.Close className="h-5 w-5 text-red-500" />
      case 'sent': return <AppIcons.Send className="h-5 w-5 text-yellow-500" />
      default: return <AppIcons.Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const filteredLogs = invitation?.emailLogs.filter(log => 
    filter === 'all' || log.status === filter
  ) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading invitation details...</div>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invitation Not Found</h3>
            <p className="text-gray-600 mb-4">The invitation you're looking for doesn't exist.</p>
            <Link href="/invitations" className="text-blue-600 hover:text-blue-800">
              ← Back to History
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    total: invitation.emailLogs.length,
    delivered: invitation.emailLogs.filter(log => log.status === 'delivered').length,
    opened: invitation.emailLogs.filter(log => log.status === 'opened').length,
    clicked: invitation.emailLogs.filter(log => log.status === 'clicked').length,
    failed: invitation.emailLogs.filter(log => log.status === 'failed').length,
    pending: invitation.emailLogs.filter(log => log.status === 'sent').length
  }

  // Count recipient types
  const recipientStats = {
    students: invitation.emailLogs.filter(log => log.student).length,
    guests: invitation.emailLogs.filter(log => log.guest).length,
    professors: invitation.emailLogs.filter(log => log.professor).length
  }

  return (
    <AdminProtection>
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/invitations" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Back to History
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{invitation.title}</h1>
          <p className="text-gray-600">{invitation.subject}</p>
          <p className="text-sm text-gray-500">
            Created: {new Date(invitation.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Analytics Cards */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Sent</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              <p className="text-sm text-gray-600">Delivered</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.opened}</p>
              <p className="text-sm text-gray-600">Opened</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.clicked}</p>
              <p className="text-sm text-gray-600">Clicked</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>

          {/* Recipient Type Stats */}
          <div className="lg:col-span-4 grid grid-cols-3 gap-4 mb-6 justify-center items-center">
            <div className="bg-blue-50 p-4 rounded-lg text-center border-radius-lg shadow-md">
              <div className="text-2xl mb-1"><AppIcons.Students size={38} className="h-5 w-5 text-blue-500" /></div>
              <p className="text-xl font-bold text-blue-600">{recipientStats.students}</p>
              <p className="text-sm text-blue-700">Students</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center border-radius-lg shadow-md">
              <div className="text-2xl mb-1"><AppIcons.Guests size={38} className="h-5 w-5 text-green-500" /></div>
              <p className="text-xl font-bold text-green-600">{recipientStats.guests}</p>
              <p className="text-sm text-green-700">Guests</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center border-radius-lg shadow-md">
              <div className="text-2xl mb-1"><AppIcons.Professors size={38} className="h-5 w-5 text-purple-500" /></div>
              <p className="text-xl font-bold text-purple-600">{recipientStats.professors}</p>
              <p className="text-sm text-purple-700">Professors</p>
            </div>
          </div>

          {/* Email Logs */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setFilter('delivered')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'delivered' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Delivered ({stats.delivered})
                </button>
                <button
                  onClick={() => setFilter('opened')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'opened' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Opened ({stats.opened})
                </button>
                <button
                  onClick={() => setFilter('failed')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'failed' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Failed ({stats.failed})
                </button>
                <button
                  onClick={() => setFilter('sent')}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    filter === 'sent' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Pending ({stats.pending})
                </button>
              </div>

              {/* Email Logs Table - FIXED */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => {
                      const recipientInfo = getRecipientInfo(log)
                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{recipientInfo.icon}</span>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{recipientInfo.name}</p>
                                <p className="text-sm text-gray-500">{recipientInfo.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {recipientInfo.type}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {recipientInfo.details}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                              {getStatusIcon(log.status)} {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {new Date(log.sentAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 text-sm text-red-600">
                            {log.errorMessage && (
                              <span className="truncate max-w-xs" title={log.errorMessage}>
                                {log.errorMessage.substring(0, 30)}...
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {filteredLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No emails found with status: {filter}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminProtection>
  )
}
