'use client'
import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import { AppIcons } from '@/components/icons/AppIcons'

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
    <div className="min-h-screen bg-gray-50 text-gray-700">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">AI-Enhanced Invitation System</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">

              {/* Enhanced Message Type Selection */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6 bg-gray-100 p-2 rounded-lg">
                <button
                  onClick={() => setActiveMessageType('email')}
                  className={`py-3 px-4 text-sm rounded-md transition-colors flex items-center justify-center gap-2 font-medium ${
                    activeMessageType === 'email'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <AppIcons.Email size={18} className="text-blue-600" />
                  <span>Email Only</span>
                </button>
                <button
                  onClick={() => setActiveMessageType('whatsapp')}
                  className={`py-3 px-4 text-sm rounded-md transition-colors flex items-center justify-center gap-2 font-medium ${
                    activeMessageType === 'whatsapp'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <AppIcons.WhatsApp size={18} className="text-green-600" />
                  <span>WhatsApp Only</span>
                </button>
                <button
                  onClick={() => setActiveMessageType('phone-sms')}
                  className={`py-3 px-4 text-sm rounded-md transition-colors flex items-center justify-center gap-2 font-medium ${
                    activeMessageType === 'phone-sms'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <AppIcons.SMS size={18} className="text-blue-600" />
                  <span>Phone SMS</span>
                </button>
                <button
                  onClick={() => setActiveMessageType('combo')}
                  className={`py-3 px-4 text-sm rounded-md transition-colors flex items-center justify-center gap-2 font-medium ${
                    activeMessageType === 'combo'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <AppIcons.Rocket size={18} className="text-purple-600" />
                  <span>All-in-One</span>
                </button>
              </div>

              {/* AI Generation Form for Email */}
              {(activeMessageType === 'email' || activeMessageType === 'combo') && showAiForm && (
                <div className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200">
                  <h3 className="text-lg font-medium mb-4 text-blue-800 flex items-center gap-2">
                    <AppIcons.AI size={16} />
                    AI Email Invitation Generator
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={aiFormData.committeeName}
                      onChange={(e) => setAiFormData({...aiFormData, committeeName: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />

                    <input
                      type="text"
                      placeholder="Venue"
                      value={aiFormData.venue}
                      onChange={(e) => setAiFormData({...aiFormData, venue: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="date"
                      value={aiFormData.date}
                      onChange={(e) => setAiFormData({...aiFormData, date: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                      type="time"
                      value={aiFormData.time}
                      onChange={(e) => setAiFormData({...aiFormData, time: e.target.value})}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <textarea
                    placeholder="Additional Information (Optional)"
                    value={aiFormData.additionalInfo}
                    onChange={(e) => setAiFormData({...aiFormData, additionalInfo: e.target.value})}
                    className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />

                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={generateWithAI}
                      disabled={aiLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
                    >
                      {aiLoading ? <AppIcons.Robot size={16} /> : <AppIcons.Send size={16} />}
                      {aiLoading ? ' Generating...' : ' Generate Email with AI'}
                    </button>
                    <button
                      onClick={() => setShowAiForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Email Form */}
              {(activeMessageType === 'email' || activeMessageType === 'combo') && (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Invitation Title (for your reference)"
                    value={invitationData.title}
                    onChange={(e) => setInvitationData({...invitationData, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <input
                    type="text"
                    placeholder="Email Subject"
                    value={invitationData.subject}
                    onChange={(e) => setInvitationData({...invitationData, subject: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />

                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setShowAiForm(!showAiForm)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <AppIcons.Robot size={16} />
                      AI Generate
                    </button>
                    <button
                      onClick={() => setPreviewMode(!previewMode)}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center gap-1"
                    >
                      <span>{previewMode ? <AppIcons.Edit size={16} /> : <AppIcons.Preview size={16} />}</span>
                      {previewMode ? 'Edit' : 'Preview'}
                    </button>
                  </div>

                  {previewMode ? (
                    <div 
                      className="border border-gray-300 rounded-lg p-4 min-h-96 bg-gray-50"
                      dangerouslySetInnerHTML={{ __html: invitationData.content }}
                    />
                  ) : (
                    <textarea
                      placeholder="Email Content (HTML supported) - Use {{name}} for personalization"
                      value={invitationData.content}
                      onChange={(e) => setInvitationData({...invitationData, content: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-96 font-mono text-sm"
                      required
                    />
                  )}
                </div>
              )}

              {/* Enhanced WhatsApp Message Form with AI */}
              {(activeMessageType === 'whatsapp' || activeMessageType === 'combo') && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-green-800 flex items-center gap-2">
                      <AppIcons.WhatsApp size={18} className="text-green-600" />
                      WhatsApp Message
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowWhatsAppAI(!showWhatsAppAI)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                      >
                       <AppIcons.AI size={16} />
                        AI Generate
                      </button>
                      <button
                        onClick={fetchTemplates}
                        className="px-3 py-1 text-sm bg-green-200 text-green-700 rounded hover:bg-green-300 flex items-center gap-1"
                      >
                        <AppIcons.Refresh size={16} className="text-green-600" />
                        Refresh Templates
                      </button>
                    </div>
                  </div>

                  {/* AI Generation Form for WhatsApp */}
                  {showWhatsAppAI && (
                    <div className="mb-4 p-4 bg-green-100 rounded-lg border border-green-300">
                      <h4 className="font-medium mb-3 text-green-800"><AppIcons.AI size={16} className="text-green-600" /> AI WhatsApp Generator</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <select
                          value={aiFormData.eventType}
                          onChange={(e) => setAiFormData({...aiFormData, eventType: e.target.value})}
                          className="p-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                          className="p-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        
                        <select
                          value={aiFormData.committeeName}
                          onChange={(e) => setAiFormData({...aiFormData, committeeName: e.target.value})}
                          className="p-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select Committee</option>
                          {committees.map(committee => (
                            <option key={committee} value={committee}>{committee}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <input
                          type="date"
                          value={aiFormData.date}
                          onChange={(e) => setAiFormData({...aiFormData, date: e.target.value})}
                          className="p-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="time"
                          value={aiFormData.time}
                          onChange={(e) => setAiFormData({...aiFormData, time: e.target.value})}
                          className="p-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="text"
                          placeholder="Venue"
                          value={aiFormData.venue}
                          onChange={(e) => setAiFormData({...aiFormData, venue: e.target.value})}
                          className="p-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <select
                          value={messageStyle}
                          onChange={(e) => setMessageStyle(e.target.value)}
                          className="p-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {messageStyles.map(style => (
                            <option key={style} value={style}>{style}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <select
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="p-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                          className="p-2 border border-green-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={generateWhatsAppWithAI}
                          disabled={aiLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-green-400"
                        >
                          {aiLoading ? ' Generating...' : ' Generate WhatsApp Message'}
                        </button>
                        <button
                          onClick={() => setShowWhatsAppAI(false)}
                          className="bg-green-300 text-green-700 px-4 py-2 rounded text-sm hover:bg-green-400"
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
                    className="w-full p-3 mb-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select enhanced template (optional)</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                       <AppIcons.List size={16} className="text-green-600" /> {template.name} - {template.category} ({template.variables?.length || 0} variables)
                      </option>
                    ))}
                  </select>

                  <textarea
                    placeholder="WhatsApp message content - Use {{name}} for personalization&#10;AI Generated or template-based content will appear here&#10;Variables: {{name}}, {{eventName}}, {{date}}, {{time}}, {{venue}}, {{committee}}, etc."
                    value={whatsappData.message}
                    onChange={(e) => setWhatsappData({...whatsappData, message: e.target.value})}
                    className="w-full p-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-32 font-mono text-sm"
                    required
                  />
                  
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <AppIcons.Info size={16} className="text-green-600" />
                      <strong>Enhanced Features:</strong> AI generation, dynamic templates, variable replacement
                    </p>
                    <div className="text-xs text-green-600 mt-1">
                      <p>Message length: {whatsappData.message.length} characters</p>
                      <p>Variables detected: {(whatsappData.message.match(/\{\{[^}]+\}\}/g) || []).length}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced SMS Form with AI */}
              {(activeMessageType === 'phone-sms' || activeMessageType === 'combo') && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-blue-800 flex items-center gap-2">
                      <AppIcons.SMS size={18} className="text-blue-600" />
                      SMS from Your Phone (500 chars max)
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSMSAI(!showSMSAI)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                      >
                        <AppIcons.AI size={16} />
                        AI Generate
                      </button>
                      <button
                        onClick={fetchSMSTemplates}
                        className="px-3 py-1 text-sm bg-blue-200 text-blue-700 rounded hover:bg-blue-300 flex items-center gap-1"
                      >
                        <AppIcons.Refresh size={16} />
                        Refresh
                      </button>
                    </div>
                  </div>

                  {/* AI Generation Form for SMS */}
                  {showSMSAI && (
                    <div className="mb-4 p-4 bg-blue-100 rounded-lg border border-blue-300">
                      <h4 className="font-medium mb-3 text-blue-800"><AppIcons.AI size={16} className="text-blue-600" /> AI SMS Generator (500 chars)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <select
                          value={aiFormData.eventType}
                          onChange={(e) => setAiFormData({...aiFormData, eventType: e.target.value})}
                          className="p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                        <input
                          type="date"
                          value={aiFormData.date}
                          onChange={(e) => setAiFormData({...aiFormData, date: e.target.value})}
                          className="p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="time"
                          value={aiFormData.time}
                          onChange={(e) => setAiFormData({...aiFormData, time: e.target.value})}
                          className="p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Venue (short)"
                          value={aiFormData.venue}
                          onChange={(e) => setAiFormData({...aiFormData, venue: e.target.value})}
                          className="p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={urgencyLevel}
                          onChange={(e) => setUrgencyLevel(e.target.value)}
                          className="p-2 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {urgencyLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={generateSMSWithAI}
                          disabled={aiLoading}
                          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-blue-400"
                        >
                          {aiLoading ? ' Generating...' : ' Generate SMS'}
                        </button>
                        <button
                          onClick={() => setShowSMSAI(false)}
                          className="bg-blue-300 text-blue-700 px-4 py-2 rounded text-sm hover:bg-blue-400"
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
                    className="w-full p-3 mb-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select SMS template (optimized for 160 chars)</option>
                    {smsTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.category} ({template.charCount || 0}/160 chars)
                      </option>
                    ))}
                  </select>

                  <textarea
                    placeholder="SMS content - Use {{name}} for personalization&#10;AI Generated or template content optimized for 160 characters&#10;Keep concise: {{name}}, {{eventName}}, {{date}}, {{time}}, {{venue}}"
                    value={phoneSmsData.message}
                    onChange={(e) => setPhoneSmsData({...phoneSmsData, message: e.target.value})}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24 font-mono text-sm"
                    maxLength={500}
                    required
                  />
                  
                  <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <p className="text-blue-700">
                        <strong>Characters:</strong> {phoneSmsData.message.length}/160
                      </p>
                      <p className="text-blue-700">
                         <strong>Cost:</strong> FREE (200 + data plan)
                      </p>
                    </div>
                    <div className="text-xs text-blue-600 mt-1 flex justify-between">
                      <p> Variables: {(phoneSmsData.message.match(/\{\{[^}]+\}\}/g) || []).length}</p>
                      <p className={phoneSmsData.message.length > 500 ? 'text-red-600' : 'text-blue-600'}>
                        {phoneSmsData.message.length > 500 ? ' Over limit!' : ' Within limit'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Send Buttons */}
              <div className="flex gap-4 pt-4">
                {activeMessageType === 'email' && (
                  <button
                    onClick={handleSendEmails}
                    disabled={loading || getTotalSelected() === 0}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-2 font-medium"
                  >
                    <AppIcons.Email size={18} />
                    {loading ? 'Sending...' : `Send Email to ${getTotalSelected()} Recipients`}
                  </button>
                )}
                
                {activeMessageType === 'whatsapp' && (
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={loading || getTotalSelected() === 0}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-2 font-medium"
                  >
                    <AppIcons.WhatsApp size={18} className="text-green-600" />
                    {loading ? 'Generating...' : `Generate WhatsApp Links for ${getTotalSelected()}`}
                  </button>
                )}

                {activeMessageType === 'phone-sms' && (
                  <button
                    onClick={handleSendPhoneSMS}
                    disabled={loading || getTotalSelected() === 0}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-2 font-medium"
                  >
                    <AppIcons.SMS size={18} className="text-blue-600" />
                    {loading ? 'Sending...' : `Send from Your Phone to ${getTotalSelected()}`}
                  </button>
                )}
                
                {activeMessageType === 'combo' && (
                  <button
                    onClick={handleSendCombo}
                    disabled={loading || getTotalSelected() === 0}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-2 font-medium"
                  >
                    <AppIcons.Rocket size={18} className="text-purple-600" />
                    {loading ? 'Processing...' : `Send All-in-One to ${getTotalSelected()}`}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recipients Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('students')}
                className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
                  activeTab === 'students' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <AppIcons.Students size={16} />
                 Students ({selectedStudents.length})
              </button>
              <button
                onClick={() => setActiveTab('guests')}
                className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
                  activeTab === 'guests' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <AppIcons.Guests size={16} />
                 Guests ({selectedGuests.length})
              </button>
              <button
                onClick={() => setActiveTab('professors')}
                className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
                  activeTab === 'professors' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <AppIcons.Professors size={16} />
                Professors ({selectedProfessors.length})
              </button>
            </div>

            {/* Select All Button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Select {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
              <button
                onClick={selectAllForCurrentTab}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {getCurrentSelected().length === getCurrentRecipients().length ? ' Deselect All' : ' Select All'}
              </button>
            </div>

            {/* Recipients List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {getCurrentRecipients().length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">
                    {activeTab === 'students' ? <AppIcons.Students size={24} /> : activeTab === 'guests' ? <AppIcons.Guests size={24} /> : <AppIcons.Professors size={24} />}
                  </div>
                  <p className="text-gray-500 text-sm">No {activeTab} available. Add {activeTab} first.</p>
                </div>
              ) : (
                getCurrentRecipients().map((recipient: any) => (
                  <div key={recipient.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border">
                    <input
                      type="checkbox"
                      checked={getCurrentSelected().includes(recipient.id)}
                      onChange={() => toggleSelection(recipient.id, activeTab)}
                      className="rounded border-gray-300 h-4 w-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{recipient.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {activeTab === 'students' ? `${recipient.course} - ${recipient.year}` :
                         activeTab === 'guests' ? `${recipient.organization} - ${recipient.designation}` :
                         `${recipient.college} - ${recipient.department}`}
                      </p>
                      {/* Show phone status for SMS */}
                      {(activeMessageType === 'phone-sms' || activeMessageType === 'combo') && (
                        <p className="text-xs text-blue-600">
                          <AppIcons.SMS size={16} className="inline-block mr-1" />
                          {recipient.phone ? 'SMS Ready' : 'No Phone'}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Enhanced Summary */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
              <p className="text-sm text-gray-800 font-medium flex items-center gap-2">
                <strong>Total Selected:</strong> {getTotalSelected()} recipients
              </p>
              <div className="text-xs text-gray-600 mt-2 space-y-1">
                <p><AppIcons.Students size={16} className="inline-block mr-1" /> Students: {selectedStudents.length}</p>
                <p><AppIcons.Guests size={16} className="inline-block mr-1" /> Guests: {selectedGuests.length}</p>
                <p><AppIcons.Professors size={16} className="inline-block mr-1" /> Professors: {selectedProfessors.length}</p>
              </div>
              {(activeMessageType === 'phone-sms' || activeMessageType === 'combo') && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    <AppIcons.SMS size={16} className="inline-block mr-1" />
                    Phone SMS: Keep httpSMS app running
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Links Modal */}
      {showWhatsappModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-96 overflow-hidden w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                <AppIcons.WhatsApp size={24} className="text-green-600" />
                WhatsApp Messages Ready
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Click on each link to send WhatsApp messages individually. Links will open in new tabs.
              </p>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-6">
              <div className="space-y-3">
                {whatsappLinks.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-bold">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{link.name}</span>
                        <span className="text-gray-500 text-sm">({link.phone})</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {link.message.substring(0, 60)}...
                      </p>
                    </div>
                    <a
                      href={link.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2 ml-4"
                    >
                      <AppIcons.WhatsApp size={16} />
                      Send WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                💡 <strong>Tip:</strong> Use "Open All Links" to send all messages quickly
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
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <AppIcons.Rocket size={16} />
                  Open All Links
                </button>
                <button
                  onClick={() => setShowWhatsappModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
