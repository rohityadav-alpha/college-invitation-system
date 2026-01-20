'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { AppIcons } from '@/components/icons/AppIcons'
import AdminProtection from '@/components/AdminProtection'

interface Student {
  id: string
  name: string
  email: string
  course: string
  year: string
  phone?: string
}

interface Guest {
  id: string
  name: string
  email: string
  organization: string
  designation: string
  category: string
  phone?: string
}

interface Professor {
  id: string
  name: string
  email: string
  college: string
  department: string
  designation: string
  phone?: string
}

interface WhatsAppTemplate {
  id: string
  name: string
  category: string
  template: string
  variables: string[]
  description?: string
}

interface SMSTemplate {
  id: string
  name: string
  category: string
  template: string
  variables: string[]
  charCount: number
  description?: string
}

interface WhatsAppLink {
  name: string
  phone: string
  whatsappLink: string
  message: string
}

export default function ComposePage() {
  // Recipients states
  const [students, setStudents] = useState<Student[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([])
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'students' | 'guests' | 'professors'>('students')
  
  // Message type state - UPDATED with phone-sms
  const [activeMessageType, setActiveMessageType] = useState<'email' | 'whatsapp' | 'phone-sms' | 'combo'>('email')
  
  // Message content states
  const [invitationData, setInvitationData] = useState({
    title: '',
    subject: '',
    content: ''
  })
  
  const [whatsappData, setWhatsappData] = useState({
    message: '',
    templateId: ''
  })
  
  // Enhanced Phone SMS data state
  const [phoneSmsData, setPhoneSmsData] = useState({
    message: '',
    templateId: ''
  })
  
  // Templates and modal states
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [smsTemplates, setSmsTemplates] = useState<SMSTemplate[]>([])
  const [whatsappLinks, setWhatsappLinks] = useState<WhatsAppLink[]>([])
  const [showWhatsappModal, setShowWhatsappModal] = useState(false)
  
  // Enhanced AI states
  const [showWhatsAppAI, setShowWhatsAppAI] = useState(false)
  const [showSMSAI, setShowSMSAI] = useState(false)
  const [messageStyle, setMessageStyle] = useState('Professional')
  const [targetAudience, setTargetAudience] = useState('Students')
  const [urgencyLevel, setUrgencyLevel] = useState('Normal')
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [showAiForm, setShowAiForm] = useState(false)

  // AI Form Data
  const [aiFormData, setAiFormData] = useState({
    committeeName: '',
    eventType: '',
    eventName: '',
    venue: '',
    date: '',
    time: '',
    additionalInfo: ''
  })

  // Constants
  const committees = [
    'Culture Committee',
    'Sports Committee', 
    'Technical Committee',
    'Literary Committee',
    'Social Service Committee',
    'Alumni Committee',
    'Anti-Ragging Committee',
    'Student Welfare Committee'
  ]

  const eventTypes = [
    'Cultural Event',
    'Technical Workshop',
    'Sports Competition', 
    'Literary Event',
    'Seminar/Webinar',
    'Competition',
    'Festival Celebration',
    'Alumni Meet',
    'Awards Ceremony',
    'Orientation Program',
    'Guest Lecture',
    'Job Fair',
    'Blood Donation Camp',
    'Art Exhibition',
    'Music Concert'
  ]

  const messageStyles = ['Professional', 'Casual', 'Exciting', 'Formal', 'Friendly']
  const targetAudiences = ['Students', 'Faculty', 'Alumni', 'Industry Professionals', 'General']
  const urgencyLevels = ['Low', 'Normal', 'High', 'Urgent']

  useEffect(() => {
    fetchAllRecipients()
    fetchTemplates()
    fetchSMSTemplates()
  }, [])

  // Fetch all recipients
  const fetchAllRecipients = async () => {
    try {
      const [studentsRes, guestsRes, professorsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/guests'),
        fetch('/api/professors')
      ])

      const [studentsData, guestsData, professorsData] = await Promise.all([
        studentsRes.json(),
        guestsRes.json(), 
        professorsRes.json()
      ])

      setStudents(studentsData)
      setGuests(guestsData)
      setProfessors(professorsData)
    } catch (error) {
      console.error('Error fetching recipients:', error)
    }
  }

  // Fetch WhatsApp templates
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/whatsapp-templates')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error)
      // Fallback templates
      setTemplates([
        {
          id: 'event-invitation',
          name: 'Event Invitation',
          category: 'Event',
          template: `🎉 *{{name}}*, You're Invited!\n\nThe {{committee}} cordially invites you to:\n\n📍 *Event:* {{eventName}}\n📅 *Date:* {{date}}\n⏰ *Time:* {{time}}\n🏢 *Venue:* {{venue}}\n\nPlease confirm your attendance!\n\nLooking forward to seeing you there! ✨`,
          variables: ['name', 'committee', 'eventName', 'date', 'time', 'venue']
        }
      ])
    }
  }

  // Fetch SMS templates
  const fetchSMSTemplates = async () => {
    try {
      const response = await fetch('/api/sms-templates')
      const data = await response.json()
      if (data.success) {
        setSmsTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching SMS templates:', error)
      // Fallback SMS templates
      setSmsTemplates([
        {
          id: 'event-sms',
          name: 'Event Invitation',
          category: 'Event',
          charCount: 155,
          template: 'Hi {{name}}! Join {{eventName}} on {{date}} at {{time}}, {{venue}}. {{committee}} invites you. RSVP: {{contact}}',
          variables: ['name', 'eventName', 'date', 'time', 'venue', 'committee', 'contact']
        }
      ])
    }
  }

  // AI generation for email (existing)
  const generateWithAI = async () => {
    if (!aiFormData.committeeName || !aiFormData.eventType || !aiFormData.eventName) {
      alert('Please fill committee, event type, and event name')
      return
    }

    setAiLoading(true)
    try {
      const response = await fetch('/api/generate-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiFormData)
      })

      const result = await response.json()

      if (response.ok) {
        setInvitationData({
          title: `${aiFormData.eventName} - ${aiFormData.committeeName}`,
          subject: result.subject,
          content: result.content
        })
        setShowAiForm(false)
        alert('🎉 AI email invitation generated successfully!')
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Network error occurred')
    } finally {
      setAiLoading(false)
    }
  }

  // NEW - AI WhatsApp generation
  const generateWhatsAppWithAI = async () => {
    if (!aiFormData.eventType || !aiFormData.eventName || !aiFormData.committeeName) {
      alert('Please fill Event Type, Event Name, and Committee')
      return
    }
    
    setAiLoading(true)
    try {
      const response = await fetch('/api/generate-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...aiFormData,
          messageStyle,
          targetAudience
        })
      })

      const result = await response.json()
      if (response.ok) {
        setWhatsappData({
          ...whatsappData,
          message: result.message
        })
        alert('🤖 AI WhatsApp message generated successfully!')
        setShowWhatsAppAI(false)
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Network error occurred')
    } finally {
      setAiLoading(false)
    }
  }

  // NEW - AI SMS generation
  const generateSMSWithAI = async () => {
    if (!aiFormData.eventType || !aiFormData.eventName) {
      alert('Please fill Event Type and Event Name')
      return
    }
    
    setAiLoading(true)
    try {
      const response = await fetch('/api/generate-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...aiFormData,
          urgency: urgencyLevel,
          includeContact: true
        })
      })

      const result = await response.json()
      if (response.ok) {
        setPhoneSmsData({
          message: result.message,
          templateId: ''
        })
        alert(`🤖 AI SMS generated! ${result.characterCount}/160 characters`)
        setShowSMSAI(false)
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Network error occurred')
    } finally {
      setAiLoading(false)
    }
  }

  // Selection functions
  const toggleSelection = (id: string, type: 'students' | 'guests' | 'professors') => {
    if (type === 'students') {
      setSelectedStudents(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      )
    } else if (type === 'guests') {
      setSelectedGuests(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      )
    } else {
      setSelectedProfessors(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      )
    }
  }

  const selectAllForCurrentTab = () => {
    if (activeTab === 'students') {
      setSelectedStudents(selectedStudents.length === students.length ? [] : students.map(s => s.id))
    } else if (activeTab === 'guests') {
      setSelectedGuests(selectedGuests.length === guests.length ? [] : guests.map(g => g.id))
    } else {
      setSelectedProfessors(selectedProfessors.length === professors.length ? [] : professors.map(p => p.id))
    }
  }

  // Send handlers
  const handleSendEmails = async () => {
    const totalSelected = selectedStudents.length + selectedGuests.length + selectedProfessors.length

    if (!invitationData.subject || !invitationData.content) {
      alert('Please fill subject and content')
      return
    }

    if (totalSelected === 0) {
      alert('Please select at least one recipient')
      return
    }

    if (!confirm(`Send invitation to ${totalSelected} recipients?`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/send-bulk-email-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invitationData,
          studentIds: selectedStudents,
          guestIds: selectedGuests,
          professorIds: selectedProfessors,
          invitationTitle: invitationData.title
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ ${result.message}`)
        setInvitationData({ title: '', subject: '', content: '' })
        setSelectedStudents([])
        setSelectedGuests([])
        setSelectedProfessors([])
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSendWhatsApp = async () => {
    const totalSelected = selectedStudents.length + selectedGuests.length + selectedProfessors.length

    if (!whatsappData.message) {
      alert('Please enter WhatsApp message')
      return
    }

    if (totalSelected === 0) {
      alert('Please select at least one recipient')
      return
    }

    if (!confirm(`Generate WhatsApp links for ${totalSelected} recipients?`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/send-whatsapp-web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: whatsappData.message,
          studentIds: selectedStudents,
          guestIds: selectedGuests,
          professorIds: selectedProfessors,
          invitationTitle: `WhatsApp: ${whatsappData.message.substring(0, 50)}`
        })
      })

      const result = await response.json()

      if (response.ok) {
        setWhatsappLinks(result.whatsappLinks || [])
        setShowWhatsappModal(true)
        alert(`✅ Generated WhatsApp links for ${result.totalRecipients} recipients!`)
        
        setWhatsappData({ message: '', templateId: '' })
        setSelectedStudents([])
        setSelectedGuests([])
        setSelectedProfessors([])
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Phone SMS send handler
  const handleSendPhoneSMS = async () => {
    const totalSelected = selectedStudents.length + selectedGuests.length + selectedProfessors.length

    if (!phoneSmsData.message) {
      alert('Please enter SMS message')
      return
    }

    if (totalSelected === 0) {
      alert('Please select at least one recipient')
      return
    }

    if (totalSelected > 100) {
      alert('Cannot send to more than 100 recipients per day (your phone\'s daily limit)')
      return
    }

    if (!confirm(`Send SMS from your phone to ${totalSelected} recipients?\nThis will use your data plan SMS quota.`)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/send-phone-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: phoneSmsData.message,
          studentIds: selectedStudents,
          guestIds: selectedGuests,
          professorIds: selectedProfessors,
          invitationTitle: `Phone SMS: ${phoneSmsData.message.substring(0, 50)}`
        })
      })

      const result = await response.json()

      if (response.ok) {
        alert(`✅ ${result.message}\n📊 Success: ${result.successCount} | Failed: ${result.failedCount}\n💰 ${result.costAnalysis?.totalCost || '₹0'}`)
        setPhoneSmsData({ message: '', templateId: '' })
        setSelectedStudents([])
        setSelectedGuests([])
        setSelectedProfessors([])
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (error) {
      alert('❌ Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Enhanced combo send
  const handleSendCombo = async () => {
    const totalSelected = selectedStudents.length + selectedGuests.length + selectedProfessors.length

    const hasEmail = invitationData.subject && invitationData.content
    const hasWhatsApp = whatsappData.message
    const hasPhoneSMS = phoneSmsData.message

    if (!hasEmail && !hasWhatsApp && !hasPhoneSMS) {
      alert('Please fill at least one message type (Email, WhatsApp, or Phone SMS)')
      return
    }

    if (totalSelected === 0) {
      alert('Please select at least one recipient')
      return
    }

    const confirmMsg = `Send combo messages to ${totalSelected} recipients?\n` +
      `📧 Email: ${hasEmail ? 'Yes' : 'No'}\n` +
      `📱 WhatsApp: ${hasWhatsApp ? 'Yes (links)' : 'No'}\n` +
      `📱 Phone SMS: ${hasPhoneSMS ? 'Yes (your phone)' : 'No'}`

    if (!confirm(confirmMsg)) {
      return
    }

    setLoading(true)

    try {
      let emailResult = null, whatsappResult = null, smsResult = null

      // Send Email
      if (hasEmail) {
        try {
          const emailResponse = await fetch('/api/send-bulk-email-enhanced', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...invitationData,
              studentIds: selectedStudents,
              guestIds: selectedGuests,
              professorIds: selectedProfessors,
              invitationTitle: invitationData.title
            })
          })
          emailResult = await emailResponse.json()
        } catch (error) {
          console.error('Email sending failed:', error)
        }
      }

      // Generate WhatsApp links
      if (hasWhatsApp) {
        try {
          const whatsappResponse = await fetch('/api/send-whatsapp-web', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: whatsappData.message,
              studentIds: selectedStudents,
              guestIds: selectedGuests,
              professorIds: selectedProfessors,
              invitationTitle: `WhatsApp: ${whatsappData.message.substring(0, 50)}`
            })
          })
          whatsappResult = await whatsappResponse.json()
          if (whatsappResult.success) {
            setWhatsappLinks(whatsappResult.whatsappLinks || [])
            setShowWhatsappModal(true)
          }
        } catch (error) {
          console.error('WhatsApp generation failed:', error)
        }
      }

      // Send Phone SMS
      if (hasPhoneSMS) {
        try {
          const smsResponse = await fetch('/api/send-phone-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: phoneSmsData.message,
              studentIds: selectedStudents,
              guestIds: selectedGuests,
              professorIds: selectedProfessors,
              invitationTitle: `Phone SMS: ${phoneSmsData.message.substring(0, 50)}`
            })
          })
          smsResult = await smsResponse.json()
        } catch (error) {
          console.error('Phone SMS sending failed:', error)
        }
      }

      // Show results
      let resultMessage = '✅ Combo campaign completed!\n'
      if (emailResult) resultMessage += `📧 Email: ${emailResult.success ? 'Sent' : 'Failed'}\n`
      if (whatsappResult) resultMessage += `📱 WhatsApp: ${whatsappResult.success ? 'Links generated' : 'Failed'}\n`
      if (smsResult) resultMessage += `📱 Phone SMS: ${smsResult.successCount || 0} sent, ${smsResult.failedCount || 0} failed\n`

      alert(resultMessage)
      
      // Clear all data
      setInvitationData({ title: '', subject: '', content: '' })
      setWhatsappData({ message: '', templateId: '' })
      setPhoneSmsData({ message: '', templateId: '' })
      setSelectedStudents([])
      setSelectedGuests([])
      setSelectedProfessors([])

    } catch (error) {
      alert('❌ Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const getCurrentRecipients = () => {
    if (activeTab === 'students') return students
    if (activeTab === 'guests') return guests
    return professors
  }

  const getCurrentSelected = () => {
    if (activeTab === 'students') return selectedStudents
    if (activeTab === 'guests') return selectedGuests
    return selectedProfessors
  }

  const getTotalSelected = () => {
    return selectedStudents.length + selectedGuests.length + selectedProfessors.length
  }

  return (
    <AdminProtection>
    
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-600">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <AppIcons.Edit size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">AI-Enhanced Invitation System</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Create and send professional invitations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Compose Form - Enhanced */}
          <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">

              {/* Enhanced Message Type Selection */}
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AppIcons.Target size={20} className="text-blue-600" />
                  Message Type
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  <button
                    onClick={() => setActiveMessageType('email')}
                    className={`py-3 sm:py-4 px-3 sm:px-4 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium hover:shadow-md ${
                      activeMessageType === 'email'
                        ? 'bg-white text-blue-600 shadow-md border-2 border-blue-200 transform scale-105'
                        : 'bg-white text-gray-600 hover:text-gray-800 border border-gray-200'
                    }`}
                  >
                    <AppIcons.Email size={18} className={activeMessageType === 'email' ? "text-blue-600" : "text-gray-500"} />
                    <span className="hidden sm:inline">Email Only</span>
                    <span className="sm:hidden">Email</span>
                  </button>
                  <button
                    onClick={() => setActiveMessageType('whatsapp')}
                    className={`py-3 sm:py-4 px-3 sm:px-4 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium hover:shadow-md ${
                      activeMessageType === 'whatsapp'
                        ? 'bg-white text-green-600 shadow-md border-2 border-green-200 transform scale-105'
                        : 'bg-white text-gray-600 hover:text-gray-800 border border-gray-200'
                    }`}
                  >
                    <AppIcons.WhatsApp size={18} className={activeMessageType === 'whatsapp' ? "text-green-600" : "text-gray-500"} />
                    <span className="hidden sm:inline">WhatsApp Only</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setActiveMessageType('phone-sms')}
                    className={`py-3 sm:py-4 px-3 sm:px-4 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium hover:shadow-md ${
                      activeMessageType === 'phone-sms'
                        ? 'bg-white text-purple-600 shadow-md border-2 border-purple-200 transform scale-105'
                        : 'bg-white text-gray-600 hover:text-gray-800 border border-gray-200'
                    }`}
                  >
                    <AppIcons.SMS size={18} className={activeMessageType === 'phone-sms' ? "text-purple-600" : "text-gray-500"} />
                    <span className="hidden sm:inline">Phone SMS</span>
                    <span className="sm:hidden">SMS</span>
                  </button>
                  <button
                    onClick={() => setActiveMessageType('combo')}
                    className={`py-3 sm:py-4 px-3 sm:px-4 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium hover:shadow-md ${
                      activeMessageType === 'combo'
                        ? 'bg-white text-indigo-600 shadow-md border-2 border-indigo-200 transform scale-105'
                        : 'bg-white text-gray-600 hover:text-gray-800 border border-gray-200'
                    }`}
                  >
                    <AppIcons.Rocket size={18} className={activeMessageType === 'combo' ? "text-indigo-600" : "text-gray-500"} />
                    <span className="hidden sm:inline">All-in-One</span>
                    <span className="sm:hidden">All</span>
                  </button>
                </div>
              </div>

              {/* AI Generation Form for Email - Enhanced */}
              {(activeMessageType === 'email' || activeMessageType === 'combo') && showAiForm && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200 shadow-md">
                  <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-blue-800 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 rounded-lg">
                      <AppIcons.AI size={16} className="text-white" />
                    </div>
                    AI Email Invitation Generator
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <select
                      value={aiFormData.committeeName}
                      onChange={(e) => setAiFormData({...aiFormData, committeeName: e.target.value})}
                      className="p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select Committee</option>
                      {committees.map(committee => (
                        <option key={committee} value={committee}>{committee}</option>
                      ))}
                    </select>

                    <select
                      value={aiFormData.eventType}
                      onChange={(e) => setAiFormData({...aiFormData, eventType: e.target.value})}
                      className="p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select Event Type</option>
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Event Name *"
                      value={aiFormData.eventName}
                      onChange={(e) => setAiFormData({...aiFormData, eventName: e.target.value})}
                      className="p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />

                    <input
                      type="text"
                      placeholder="Venue"
                      value={aiFormData.venue}
                      onChange={(e) => setAiFormData({...aiFormData, venue: e.target.value})}
                      className="p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />

                    <input
                      type="date"
                      value={aiFormData.date}
                      onChange={(e) => setAiFormData({...aiFormData, date: e.target.value})}
                      className="p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />

                    <input
                      type="time"
                      value={aiFormData.time}
                      onChange={(e) => setAiFormData({...aiFormData, time: e.target.value})}
                      className="p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <textarea
                    placeholder="Additional Information (Optional)"
                    value={aiFormData.additionalInfo}
                    onChange={(e) => setAiFormData({...aiFormData, additionalInfo: e.target.value})}
                    className="w-full mt-4 p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={3}
                  />

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
                    <button
                      onClick={generateWithAI}
                      disabled={aiLoading}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg transition-all"
                    >
                      {aiLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <AppIcons.Send size={16} />
                      )}
                      {aiLoading ? 'Generating...' : 'Generate Email with AI'}
                    </button>
                    <button
                      onClick={() => setShowAiForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Email Form - Enhanced */}
              {(activeMessageType === 'email' || activeMessageType === 'combo') && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <AppIcons.Email size={20} className="text-blue-600" />
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Email Content</h3>
                  </div>

                  <input
                    type="text"
                    placeholder="Invitation Title (for your reference)"
                    value={invitationData.title}
                    onChange={(e) => setInvitationData({...invitationData, title: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  
                  <input
                    type="text"
                    placeholder="Email Subject"
                    value={invitationData.subject}
                    onChange={(e) => setInvitationData({...invitationData, subject: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />

                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      onClick={() => setShowAiForm(!showAiForm)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 sm:gap-2 font-medium transition-colors"
                    >
                      <AppIcons.Robot size={14} />
                      AI Generate
                    </button>
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-1 sm:gap-2 font-medium transition-colors"
                    >
                      {previewMode ? <AppIcons.Edit size={14} /> : <AppIcons.Preview size={14} />}
                      {previewMode ? 'Edit' : 'Preview'}
                    </button>
                  </div>

                  {previewMode ? (
                    <div 
                      className="border border-gray-300 rounded-xl p-4 sm:p-6 min-h-96 bg-gray-50 shadow-inner"
                      dangerouslySetInnerHTML={{ __html: invitationData.content }}
                    />
                  ) : (
                    <textarea
                      placeholder="Email Content (HTML supported) - Use {{name}} for personalization"
                      value={invitationData.content}
                      onChange={(e) => setInvitationData({...invitationData, content: e.target.value})}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-96 font-mono text-sm transition-all"
                      required
                    />
                  )}
                </div>
              )}

              {/* Enhanced WhatsApp Message Form with AI */}
              {(activeMessageType === 'whatsapp' || activeMessageType === 'combo') && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border-2 border-green-200 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h3 className="text-lg sm:text-xl font-medium text-green-800 flex items-center gap-2">
                      <div className="p-1.5 bg-green-600 rounded-lg">
                        <AppIcons.WhatsApp size={16} className="text-white" />
                      </div>
                      WhatsApp Message
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setShowWhatsAppAI(!showWhatsAppAI)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 sm:gap-2 font-medium transition-colors"
                      >
                       <AppIcons.AI size={14} />
                        AI Generate
                      </button>
                      <button
                        onClick={fetchTemplates}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-200 text-green-700 rounded-lg hover:bg-green-300 flex items-center gap-1 sm:gap-2 font-medium transition-colors"
                      >
                        <AppIcons.Refresh size={14} />
                        <span className="hidden sm:inline">Refresh Templates</span>
                        <span className="sm:hidden">Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Generation Form for WhatsApp */}
                  {showWhatsAppAI && (
                    <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-green-100 rounded-xl border border-green-300 shadow-inner">
                      <h4 className="font-medium mb-3 sm:mb-4 text-green-800 flex items-center gap-2">
                        <AppIcons.AI size={16} className="text-green-600" />
                        AI WhatsApp Generator
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 sm:mb-4">
                        <select
                          value={aiFormData.eventType}
                          onChange={(e) => setAiFormData({...aiFormData, eventType: e.target.value})}
                          className="p-2 sm:p-3 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select Event Type</option>
                          {eventTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        
                        <input
                          type="text"
                          placeholder="Event Name"
                          value={aiFormData.eventName}
                          onChange={(e) => setAiFormData({...aiFormData, eventName: e.target.value})}
                          className="p-2 sm:p-3 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                        
                        <select
                          value={aiFormData.committeeName}
                          onChange={(e) => setAiFormData({...aiFormData, committeeName: e.target.value})}
                          className="p-2 sm:p-3 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select Committee</option>
                          {committees.map(committee => (
                            <option key={committee} value={committee}>{committee}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 sm:mb-4">
                        <input
                          type="date"
                          value={aiFormData.date}
                          onChange={(e) => setAiFormData({...aiFormData, date: e.target.value})}
                          className="p-2 sm:p-3 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                        <input
                          type="time"
                          value={aiFormData.time}
                          onChange={(e) => setAiFormData({...aiFormData, time: e.target.value})}
                          className="p-2 sm:p-3 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Venue"
                          value={aiFormData.venue}
                          onChange={(e) => setAiFormData({...aiFormData, venue: e.target.value})}
                          className="p-2 sm:p-3 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                        <select
                          value={messageStyle}
                          onChange={(e) => setMessageStyle(e.target.value)}
                          className="p-2 sm:p-3 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          {messageStyles.map(style => (
                            <option key={style} value={style}>{style}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 sm:mb-4">
                        <select
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="p-2 sm:p-3 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        >
                          <option value="">Target Audience</option>
                          {targetAudiences.map(audience => (
                            <option key={audience} value={audience}>{audience}</option>
                          ))}
                        </select>
                        
                        <textarea
                          placeholder="Additional details (optional)"
                          value={aiFormData.additionalInfo}
                          onChange={(e) => setAiFormData({...aiFormData, additionalInfo: e.target.value})}
                          className="p-2 sm:p-3 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          rows={2}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={generateWhatsAppWithAI}
                          disabled={aiLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          {aiLoading ? 'Generating...' : 'Generate WhatsApp Message'}
                        </button>
                        <button
                          onClick={() => setShowWhatsAppAI(false)}
                          className="bg-green-300 text-green-700 px-4 py-2 rounded-lg text-sm hover:bg-green-400 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Enhanced Template Selector */}
                  <select
                    value={whatsappData.templateId}
                    onChange={(e) => {
                      const template = templates.find(t => t.id === e.target.value)
                      setWhatsappData({
                        templateId: e.target.value,
                        message: template ? template.template : ''
                      })
                    }}
                    className="w-full p-3 sm:p-4 mb-3 sm:mb-4 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select enhanced template (optional)</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.category} ({template.variables?.length || 0} variables)
                      </option>
                    ))}
                  </select>

                  <textarea
                    placeholder={`WhatsApp message content - Use {{name}} for personalization\nAI Generated or template-based content will appear here\nVariables: {{name}}, {{eventName}}, {{date}}, {{time}}, {{venue}}, {{committee}}, etc.`}
                    value={whatsappData.message}
                    onChange={(e) => setWhatsappData({...whatsappData, message: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-32 font-mono text-sm transition-all"
                    required
                  />
                  
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-100 rounded-xl border border-green-200">
                    <p className="text-sm text-green-700 flex items-center gap-2 font-medium">
                      <AppIcons.Info size={16} className="text-green-600" />
                      Enhanced Features: AI generation, dynamic templates, variable replacement
                    </p>
                    <div className="text-xs text-green-600 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      <p>Message length: {whatsappData.message.length} characters</p>
                      <p>Variables detected: {(whatsappData.message.match(/\{\{[^}]+\}\}/g) || []).length}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced SMS Form with AI */}
              {(activeMessageType === 'phone-sms' || activeMessageType === 'combo') && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 border-2 border-purple-200 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <h3 className="text-lg sm:text-xl font-medium text-purple-800 flex items-center gap-2">
                      <div className="p-1.5 bg-purple-600 rounded-lg">
                        <AppIcons.SMS size={16} className="text-white" />
                      </div>
                      SMS from Your Phone (500 chars max)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setShowSMSAI(!showSMSAI)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 sm:gap-2 font-medium transition-colors"
                      >
                        <AppIcons.AI size={14} />
                        AI Generate
                      </button>
                      <button
                        onClick={fetchSMSTemplates}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-purple-200 text-purple-700 rounded-lg hover:bg-purple-300 flex items-center gap-1 sm:gap-2 font-medium transition-colors"
                      >
                        <AppIcons.Refresh size={14} />
                        <span className="hidden sm:inline">Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Generation Form for SMS */}
                  {showSMSAI && (
                    <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-purple-100 rounded-xl border border-purple-300 shadow-inner">
                      <h4 className="font-medium mb-3 sm:mb-4 text-purple-800 flex items-center gap-2">
                        <AppIcons.AI size={16} className="text-purple-600" />
                        AI SMS Generator (500 chars)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 sm:mb-4">
                        <select
                          value={aiFormData.eventType}
                          onChange={(e) => setAiFormData({...aiFormData, eventType: e.target.value})}
                          className="p-2 sm:p-3 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                          <option value="">Event Type</option>
                          {eventTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        
                        <input
                          type="text"
                          placeholder="Event Name (short)"
                          value={aiFormData.eventName}
                          onChange={(e) => setAiFormData({...aiFormData, eventName: e.target.value})}
                          className="p-2 sm:p-3 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 sm:mb-4">
                        <input
                          type="date"
                          value={aiFormData.date}
                          onChange={(e) => setAiFormData({...aiFormData, date: e.target.value})}
                          className="p-2 sm:p-3 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <input
                          type="time"
                          value={aiFormData.time}
                          onChange={(e) => setAiFormData({...aiFormData, time: e.target.value})}
                          className="p-2 sm:p-3 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Venue (short)"
                          value={aiFormData.venue}
                          onChange={(e) => setAiFormData({...aiFormData, venue: e.target.value})}
                          className="p-2 sm:p-3 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <select
                          value={urgencyLevel}
                          onChange={(e) => setUrgencyLevel(e.target.value)}
                          className="p-2 sm:p-3 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                          {urgencyLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={generateSMSWithAI}
                          disabled={aiLoading}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          {aiLoading ? 'Generating...' : 'Generate SMS'}
                        </button>
                        <button
                          onClick={() => setShowSMSAI(false)}
                          className="bg-purple-300 text-purple-700 px-4 py-2 rounded-lg text-sm hover:bg-purple-400 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Enhanced SMS Template Selector */}
                  <select
                    value={phoneSmsData.templateId || ''}
                    onChange={(e) => {
                      const template = smsTemplates.find(t => t.id === e.target.value)
                      setPhoneSmsData({
                        ...phoneSmsData,
                        message: template ? template.template : phoneSmsData.message,
                        templateId: e.target.value
                      })
                    }}
                    className="w-full p-3 sm:p-4 mb-3 sm:mb-4 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select SMS template (optimized for 160 chars)</option>
                    {smsTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.category} ({template.charCount || 0}/160 chars)
                      </option>
                    ))}
                  </select>

                  <textarea
                    placeholder={`SMS content - Use {{name}} for personalization\nAI Generated or template content optimized for 160 characters\nKeep concise: {{name}}, {{eventName}}, {{date}}, {{time}}, {{venue}}`}
                    value={phoneSmsData.message}
                    onChange={(e) => setPhoneSmsData({...phoneSmsData, message: e.target.value})}
                    className="w-full p-3 sm:p-4 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-24 font-mono text-sm transition-all"
                    maxLength={500}
                    required
                  />
                  
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-purple-100 rounded-xl border border-purple-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2 sm:gap-0">
                      <p className="text-purple-700 font-medium">
                        Characters: {phoneSmsData.message.length}/160
                      </p>
                      <p className="text-purple-700 font-medium">
                         Cost: FREE (200 + data plan)
                      </p>
                    </div>
                    <div className="text-xs text-purple-600 mt-2 flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
                      <p>Variables: {(phoneSmsData.message.match(/\{\{[^}]+\}\}/g) || []).length}</p>
                      <p className={phoneSmsData.message.length > 500 ? 'text-red-600 font-medium' : 'text-purple-600'}>
                        {phoneSmsData.message.length > 500 ? 'Over limit!' : 'Within limit'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Send Buttons */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AppIcons.Send size={20} className="text-indigo-600" />
                  Send Campaign
                </h3>
                <div className="flex flex-col gap-3 sm:gap-4">
                  {activeMessageType === 'email' && (
                    <button
                      onClick={handleSendEmails}
                      disabled={loading || getTotalSelected() === 0}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg transition-all"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <AppIcons.Email size={18} />
                      )}
                      {loading ? 'Sending...' : `Send Email to ${getTotalSelected()} Recipients`}
                    </button>
                  )}
                  
                  {activeMessageType === 'whatsapp' && (
                    <button
                      onClick={handleSendWhatsApp}
                      disabled={loading || getTotalSelected() === 0}
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg transition-all"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <AppIcons.WhatsApp size={18} />
                      )}
                      {loading ? 'Generating...' : `Generate WhatsApp Links for ${getTotalSelected()}`}
                    </button>
                  )}

                  {activeMessageType === 'phone-sms' && (
                    <button
                      onClick={handleSendPhoneSMS}
                      disabled={loading || getTotalSelected() === 0}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg transition-all"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <AppIcons.SMS size={18} />
                      )}
                      {loading ? 'Sending...' : `Send from Your Phone to ${getTotalSelected()}`}
                    </button>
                  )}
                  
                  {activeMessageType === 'combo' && (
                    <button
                      onClick={handleSendCombo}
                      disabled={loading || getTotalSelected() === 0}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg transition-all"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <AppIcons.Rocket size={18} />
                      )}
                      {loading ? 'Processing...' : `Send All-in-One to ${getTotalSelected()}`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recipients Selection - Enhanced */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <AppIcons.UserGroup size={20} className="text-blue-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recipients</h2>
            </div>

            {/* Tab Navigation - Enhanced */}
            <div className="bg-gray-50 rounded-xl p-1.5 mb-4 sm:mb-6">
              <button
                onClick={() => setActiveTab('students')}
                className={`flex-1 sm:flex-none w-full sm:w-auto py-2.5 px-3 sm:px-4 text-xs sm:text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 font-medium mb-1 sm:mb-0 sm:mr-1 ${
                  activeTab === 'students' 
                    ? 'bg-white text-blue-600 shadow-md border-2 border-blue-200' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                <AppIcons.Students size={16} />
                <span>Students ({selectedStudents.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('guests')}
                className={`flex-1 sm:flex-none w-full sm:w-auto py-2.5 px-3 sm:px-4 text-xs sm:text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 font-medium mb-1 sm:mb-0 sm:mr-1 ${
                  activeTab === 'guests' 
                    ? 'bg-white text-green-600 shadow-md border-2 border-green-200' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                <AppIcons.Guests size={16} />
                <span>Guests ({selectedGuests.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('professors')}
                className={`flex-1 sm:flex-none w-full sm:w-auto py-2.5 px-3 sm:px-4 text-xs sm:text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 font-medium ${
                  activeTab === 'professors' 
                    ? 'bg-white text-purple-600 shadow-md border-2 border-purple-200' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                <AppIcons.Professors size={16} />
                <span>Professors ({selectedProfessors.length})</span>
              </button>
            </div>

            {/* Select All Button - Enhanced */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Select {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
              <button
                onClick={selectAllForCurrentTab}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {getCurrentSelected().length === getCurrentRecipients().length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Recipients List - Enhanced */}
            <div className="max-h-80 sm:max-h-96 overflow-y-auto space-y-2 sm:space-y-3">
              {getCurrentRecipients().length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 opacity-30">
                    {activeTab === 'students' ? <AppIcons.Students size={48} className="mx-auto text-gray-300" /> : 
                     activeTab === 'guests' ? <AppIcons.Guests size={48} className="mx-auto text-gray-300" /> : 
                     <AppIcons.Professors size={48} className="mx-auto text-gray-300" />}
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base font-medium">No {activeTab} available. Add {activeTab} first.</p>
                </div>
              ) : (
                getCurrentRecipients().map((recipient: any) => (
                  <div key={recipient.id} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 hover:bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getCurrentSelected().includes(recipient.id)}
                      onChange={() => toggleSelection(recipient.id, activeTab)}
                      className="rounded border-gray-300 h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">{recipient.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {activeTab === 'students' ? `${recipient.course} - ${recipient.year}` :
                         activeTab === 'guests' ? `${recipient.organization} - ${recipient.designation}` :
                         `${recipient.college} - ${recipient.department}`}
                      </p>
                      {/* Show phone status for SMS */}
                      {(activeMessageType === 'phone-sms' || activeMessageType === 'combo') && (
                        <p className={`text-xs flex items-center gap-1 mt-1 ${recipient.phone ? 'text-green-600' : 'text-red-500'}`}>
                          <AppIcons.SMS size={12} />
                          <span>{recipient.phone ? 'SMS Ready' : 'No Phone'}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Enhanced Summary */}
            <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl border-2 border-blue-200 shadow-inner">
              <p className="text-sm sm:text-base text-gray-800 font-bold flex items-center gap-2 mb-3">
                <AppIcons.Target size={18} className="text-indigo-600" />
                Total Selected: {getTotalSelected()} recipients
              </p>
              <div className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
                <p className="flex items-center gap-2">
                  <AppIcons.Students size={14} className="text-blue-500" />
                  <span>Students: <span className="font-medium text-blue-700">{selectedStudents.length}</span></span>
                </p>
                <p className="flex items-center gap-2">
                  <AppIcons.Guests size={14} className="text-green-500" />
                  <span>Guests: <span className="font-medium text-green-700">{selectedGuests.length}</span></span>
                </p>
                <p className="flex items-center gap-2">
                  <AppIcons.Professors size={14} className="text-purple-500" />
                  <span>Professors: <span className="font-medium text-purple-700">{selectedProfessors.length}</span></span>
                </p>
              </div>
              {(activeMessageType === 'phone-sms' || activeMessageType === 'combo') && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200">
                  <p className="text-xs sm:text-sm text-blue-600 flex items-center gap-2 font-medium">
                    <AppIcons.SMS size={14} />
                    <span>Phone SMS: Keep httpSMS app running</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Links Modal - Enhanced */}
      {showWhatsappModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-96 overflow-hidden w-full shadow-2xl border-2 border-gray-200">
            <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-xl sm:text-2xl font-bold text-green-800 flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <AppIcons.WhatsApp size={24} className="text-white" />
                </div>
                WhatsApp Messages Ready
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-2">
                Click on each link to send WhatsApp messages individually. Links will open in new tabs.
              </p>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {whatsappLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 sm:p-4 border-2 border-green-200 rounded-xl bg-green-50 hover:bg-green-100 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-green-600 font-bold text-sm sm:text-base">#{index + 1}</span>
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{link.name}</span>
                        <span className="text-gray-500 text-xs sm:text-sm">({link.phone})</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                        {link.message.substring(0, 60)}...
                      </p>
                    </div>
                    <a
                      href={link.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 ml-4 font-medium shadow-lg"
                    >
                      <AppIcons.WhatsApp size={16} />
                      <span className="hidden sm:inline">Send WhatsApp</span>
                      <span className="sm:hidden">Send</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 sm:p-6 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <AppIcons.Info size={16} className="text-blue-500" />
                <span><strong>Tip:</strong> Use "Open All Links" to send all messages quickly</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    whatsappLinks.forEach((link, index) => {
                      setTimeout(() => {
                        window.open(link.whatsappLink, '_blank')
                      }, index * 500)
                    })
                  }}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 font-medium shadow-lg"
                >
                  <AppIcons.Rocket size={16} />
                  <span>Open All Links</span>
                </button>
                <button
                  onClick={() => setShowWhatsappModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl hover:bg-gray-400 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminProtection>
  )
}
