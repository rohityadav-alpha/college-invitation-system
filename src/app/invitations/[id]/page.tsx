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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Enhanced Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/invitations"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base mb-4 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all font-medium"
          >
            <AppIcons.ArrowLeft size={16} />
            <span>Back to History</span>
          </Link>
          
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
              <AppIcons.Email size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{invitation.title}</h1>
              <p className="text-base sm:text-lg text-gray-700 mb-3">{invitation.subject}</p>
              <p className="text-xs sm:text-sm text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
                Created: {new Date(invitation.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Enhanced Analytics Cards */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-xl shadow-lg border-2 border-gray-200 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="p-2 bg-gray-100 rounded-lg mb-3 mx-auto w-fit group-hover:bg-gray-200 transition-colors">
                <AppIcons.Send size={20} className="text-gray-600" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stats.total}</p>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Sent</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl shadow-lg border-2 border-green-200 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="p-2 bg-green-200 rounded-lg mb-3 mx-auto w-fit group-hover:bg-green-300 transition-colors">
                <AppIcons.Check size={20} className="text-green-700" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1">{stats.delivered}</p>
              <p className="text-xs sm:text-sm font-medium text-green-700">Delivered</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl shadow-lg border-2 border-blue-200 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="p-2 bg-blue-200 rounded-lg mb-3 mx-auto w-fit group-hover:bg-blue-300 transition-colors">
                <AppIcons.Preview size={20} className="text-blue-700" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1">{stats.opened}</p>
              <p className="text-xs sm:text-sm font-medium text-blue-700">Opened</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl shadow-lg border-2 border-purple-200 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="p-2 bg-purple-200 rounded-lg mb-3 mx-auto w-fit group-hover:bg-purple-300 transition-colors">
                <AppIcons.Check size={20} className="text-purple-700" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1">{stats.clicked}</p>
              <p className="text-xs sm:text-sm font-medium text-purple-700">Clicked</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-xl shadow-lg border-2 border-red-200 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="p-2 bg-red-200 rounded-lg mb-3 mx-auto w-fit group-hover:bg-red-300 transition-colors">
                <AppIcons.Close size={20} className="text-red-700" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600 mb-1">{stats.failed}</p>
              <p className="text-xs sm:text-sm font-medium text-red-700">Failed</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 sm:p-6 rounded-xl shadow-lg border-2 border-yellow-200 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="p-2 bg-yellow-200 rounded-lg mb-3 mx-auto w-fit group-hover:bg-yellow-300 transition-colors">
                <AppIcons.Clock size={20} className="text-yellow-700" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</p>
              <p className="text-xs sm:text-sm font-medium text-yellow-700">Pending</p>
            </div>
          </div>

          {/* Enhanced Recipient Type Stats */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-blue-200 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-200 rounded-full group-hover:bg-blue-300 transition-colors">
                  <AppIcons.Students size={32} className="text-blue-700" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{recipientStats.students}</p>
              <p className="text-sm sm:text-base font-semibold text-blue-700">Students</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-green-200 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-200 rounded-full group-hover:bg-green-300 transition-colors">
                  <AppIcons.Guests size={32} className="text-green-700" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">{recipientStats.guests}</p>
              <p className="text-sm sm:text-base font-semibold text-green-700">Guests</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-xl shadow-lg border-2 border-purple-200 text-center hover:shadow-xl transition-all duration-300 group">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-200 rounded-full group-hover:bg-purple-300 transition-colors">
                  <AppIcons.Professors size={32} className="text-purple-700" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">{recipientStats.professors}</p>
              <p className="text-sm sm:text-base font-semibold text-purple-700">Professors</p>
            </div>
          </div>

          {/* Enhanced Email Logs */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <AppIcons.List size={20} className="text-indigo-600" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Email Delivery Logs</h3>
              </div>
              
              {/* Enhanced Filter Buttons */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                      filter === 'all' 
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <AppIcons.List size={14} />
                    <span>All ({stats.total})</span>
                  </button>
                  
                  <button
                    onClick={() => setFilter('delivered')}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                      filter === 'delivered' 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <AppIcons.Check size={14} />
                    <span className="hidden sm:inline">Delivered ({stats.delivered})</span>
                    <span className="sm:hidden">Delivered</span>
                  </button>
                  
                  <button
                    onClick={() => setFilter('opened')}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                      filter === 'opened' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <AppIcons.Preview size={14} />
                    <span className="hidden sm:inline">Opened ({stats.opened})</span>
                    <span className="sm:hidden">Opened</span>
                  </button>
                  
                  <button
                    onClick={() => setFilter('failed')}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                      filter === 'failed' 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <AppIcons.Close size={14} />
                    <span className="hidden sm:inline">Failed ({stats.failed})</span>
                    <span className="sm:hidden">Failed</span>
                  </button>
                  
                  <button
                    onClick={() => setFilter('sent')}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 ${
                      filter === 'sent' 
                        ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <AppIcons.Clock size={14} />
                    <span className="hidden sm:inline">Pending ({stats.pending})</span>
                    <span className="sm:hidden">Pending</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Email Logs Table */}
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Recipient</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Details</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sent At</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredLogs.map((log) => {
                        const recipientInfo = getRecipientInfo(log)
                        return (
                          <tr key={log.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200">
                            <td className="px-4 sm:px-6 py-4 sm:py-5">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                                  <span className="text-lg">{recipientInfo.icon}</span>
                                </div>
                                <div>
                                  <p className="text-sm sm:text-base font-semibold text-gray-900">{recipientInfo.name}</p>
                                  <p className="text-xs sm:text-sm text-gray-600">{recipientInfo.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 sm:py-5">
                              <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                                {recipientInfo.type}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-gray-700">
                              <div className="max-w-xs truncate" title={recipientInfo.details}>
                                {recipientInfo.details}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 sm:py-5">
                              <span className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold border-2 ${getStatusColor(log.status)}`}>
                                {getStatusIcon(log.status)} 
                                <span>{log.status}</span>
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-gray-700">
                              <div className="bg-gray-100 rounded-lg px-2 py-1">
                                {new Date(log.sentAt).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-red-600">
                              {log.errorMessage && (
                                <div className="max-w-xs bg-red-50 border border-red-200 rounded-lg px-2 py-1" title={log.errorMessage}>
                                  <span className="truncate">
                                    {log.errorMessage.substring(0, 30)}...
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {filteredLogs.length === 0 && (
                    <div className="text-center py-12">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-gray-100 rounded-full">
                          <AppIcons.Search size={32} className="text-gray-400" />
                        </div>
                      </div>
                      <p className="text-lg font-medium text-gray-700 mb-2">No emails found</p>
                      <p className="text-sm text-gray-500">No emails found with status: <span className="font-semibold">{filter}</span></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    </AdminProtection>
  )
}
