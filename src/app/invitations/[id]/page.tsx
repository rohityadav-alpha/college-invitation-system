'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [invitation, setInvitation] = useState<InvitationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [retrying, setRetrying] = useState(false)
  
  // New states for edit/delete functionality
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    subject: '',
    content: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchInvitation()
    }
  }, [params.id])

  const fetchInvitation = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invitations/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvitation(data)
        setEditForm({
          title: data.title || '',
          subject: data.subject || '',
          content: data.content || ''
        })
      } else {
        console.error('Failed to fetch invitation')
      }
    } catch (error) {
      console.error('Error fetching invitation:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle Edit functionality
  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!editForm.title.trim() || !editForm.subject.trim() || !editForm.content.trim()) {
      alert('Please fill all fields')
      return
    }

    try {
      setIsEditing(false)
      const response = await fetch(`/api/invitations/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const updatedInvitation = await response.json()
        setInvitation(prev => prev ? { ...prev, ...updatedInvitation } : null)
        alert('Invitation updated successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to update: ${error.error}`)
        setIsEditing(true)
      }
    } catch (error) {
      console.error('Error updating invitation:', error)
      alert('Error updating invitation')
      setIsEditing(true)
    }
  }

  const handleCancelEdit = () => {
    if (invitation) {
      setEditForm({
        title: invitation.title,
        subject: invitation.subject,
        content: invitation.content
      })
    }
    setIsEditing(false)
  }

  // Handle Delete functionality
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
      deleteInvitation()
    }
  }

  const deleteInvitation = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/invitations/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Invitation deleted successfully!')
        router.push('/invitations')
      } else {
        const error = await response.json()
        alert(`Failed to delete: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting invitation:', error)
      alert('Error deleting invitation')
    } finally {
      setIsDeleting(false)
    }
  }

  const retryFailedMessages = async () => {
    setRetrying(true)
    // Simulate retry operation
    setTimeout(() => {
      setRetrying(false)
      alert('Failed messages have been retried!')
      fetchInvitation() // Refresh data
    }, 2000)
  }

  const getRecipientInfo = (log: EmailLog) => {
    if (log.student) {
      return {
        name: log.student.name,
        email: log.student.email,
        type: 'Student',
        details: `${log.student.course} - ${log.student.year}`,
        icon: '👨‍🎓'
      }
    } else if (log.guest) {
      return {
        name: log.guest.name,
        email: log.guest.email,
        type: 'Guest',
        details: `${log.guest.organization} - ${log.guest.designation}`,
        icon: '🤝'
      }
    } else if (log.professor) {
      return {
        name: log.professor.name,
        email: log.professor.email,
        type: 'Professor',
        details: `${log.professor.college} - ${log.professor.department}`,
        icon: '👨‍🏫'
      }
    }
    return {
      name: 'Unknown',
      email: 'N/A',
      type: 'Unknown',
      details: 'No details available',
      icon: '❓'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return '✅'
      case 'opened': return '👁️'
      case 'clicked': return '🔗'
      case 'failed': return '❌'
      case 'sent': return '📤'
      default: return '⏳'
    }
  }

  const filteredLogs = invitation ? invitation.emailLogs.filter(log => {
    const statusMatch = filter === 'all' || log.status === filter
    const channelMatch = channelFilter === 'all' || channelFilter === 'email'
    return statusMatch && channelMatch
  }) : []

  const stats = invitation ? {
    total: invitation.emailLogs.length,
    delivered: invitation.emailLogs.filter(log => log.status === 'delivered').length,
    opened: invitation.emailLogs.filter(log => log.status === 'opened').length,
    clicked: invitation.emailLogs.filter(log => log.status === 'clicked').length,
    failed: invitation.emailLogs.filter(log => log.status === 'failed').length,
    pending: invitation.emailLogs.filter(log => log.status === 'sent').length,
  } : { total: 0, delivered: 0, opened: 0, clicked: 0, failed: 0, pending: 0 }

  if (loading) {
    return (
      <AdminProtection>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading invitation details...</p>
          </div>
        </div>
      </AdminProtection>
    )
  }

  if (!invitation) {
    return (
      <AdminProtection>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Not Found</h2>
            <p className="text-gray-600 mb-4">The invitation you're looking for doesn't exist.</p>
            <Link
              href="/invitations"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to History
            </Link>
          </div>
        </div>
      </AdminProtection>
    )
  }

  return (
    <AdminProtection>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header with Back Button and Edit/Delete */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/invitations"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-all font-medium"
              >
                <AppIcons.ArrowLeft size={16} />
                Back to History
              </Link>
              <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                  <AppIcons.Preview size={20} className="text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Campaign Details</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Edit Button */}
              <button
                onClick={handleEdit}
                disabled={isEditing}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 shadow-lg transition-all font-medium"
              >
                <AppIcons.Edit size={16} />
                Edit
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 shadow-lg transition-all font-medium"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <AppIcons.Delete size={16} />
                    <span>Delete</span>
                  </>
                )}
              </button>

              {stats.failed > 0 && (
                <button
                  onClick={retryFailedMessages}
                  disabled={retrying}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 shadow-lg transition-all font-medium flex items-center gap-2"
                >
                  {retrying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Retrying...</span>
                    </>
                  ) : (
                    <>
                      <AppIcons.Refresh size={16} />
                      <span>Retry {stats.failed} Failed</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Edit Modal */}
          {isEditing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <AppIcons.Edit size={20} />
                    Edit Invitation
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter invitation title..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={editForm.subject}
                        onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email subject..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                      </label>
                      <textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter invitation content..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={handleCancelEdit}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
                    >
                      <AppIcons.Check size={16} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invitation Info */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <AppIcons.Send size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{invitation.subject}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <AppIcons.Calendar size={16} />
                  <p>Created: {new Date(invitation.createdAt).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{invitation.content}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg border-2 border-blue-200 p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.Send size={20} className="text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
              <div className="text-sm text-blue-700 font-medium">Total Sent</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg border-2 border-green-200 p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.Check size={20} className="text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.delivered}</div>
              <div className="text-sm text-green-700 font-medium">Delivered</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg border-2 border-purple-200 p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.Preview size={20} className="text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.opened}</div>
              <div className="text-sm text-purple-700 font-medium">Opened</div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-lg border-2 border-indigo-200 p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.ExternalLink size={20} className="text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.clicked}</div>
              <div className="text-sm text-indigo-700 font-medium">Clicked</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg border-2 border-red-200 p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.Close size={20} className="text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-600 mb-2">{stats.failed}</div>
              <div className="text-sm text-red-700 font-medium">Failed</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg border-2 border-yellow-200 p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <AppIcons.Clock size={20} className="text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
              <div className="text-sm text-yellow-700 font-medium">Pending</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <AppIcons.Filter size={18} className="text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900">Filter Options</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <AppIcons.Check size={16} />
                  Filter by Status:
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="opened">Opened</option>
                  <option value="clicked">Clicked</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <AppIcons.Filter size={16} />
                  Filter by Channel:
                </label>
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="all">All Channels</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 border-b-2 border-blue-200">
              <div className="flex items-center gap-3">
                <AppIcons.List size={20} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Message Logs ({filteredLogs.length} records)</h3>
              </div>
            </div>
            
            {filteredLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.User size={14} />
                          Recipient
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.Zap size={14} />
                          Channel
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.Link size={14} />
                          Type
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.Info size={14} />
                          Details
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.List size={14} />
                          Status
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.Clock size={14} />
                          Timestamp
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <AppIcons.Warning size={14} />
                          Error
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.map((log) => {
                      const recipientInfo = getRecipientInfo(log)
                      return (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                <span>{recipientInfo.icon}</span>
                                <span>{recipientInfo.name}</span>
                              </div>
                              <div className="text-sm text-gray-600">{recipientInfo.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              EMAIL
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {recipientInfo.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {recipientInfo.details}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                              log.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              log.status === 'opened' ? 'bg-purple-100 text-purple-800' :
                              log.status === 'clicked' ? 'bg-indigo-100 text-indigo-800' :
                              log.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              <span>{getStatusIcon(log.status)}</span>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(log.sentAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {log.errorMessage && (
                              <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
                                {log.errorMessage}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <AppIcons.Search size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Found</h3>
                <p className="text-gray-600">
                  {filter === 'all' && channelFilter === 'all' 
                    ? 'No messages found' 
                    : `No messages found with status: ${filter} and channel: ${channelFilter}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminProtection>
  )
}
