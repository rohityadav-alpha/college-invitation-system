import { NextRequest, NextResponse } from 'next/server'

interface SMSTemplate {
  id: string
  name: string
  category: string
  template: string
  variables: string[]
  charCount: number
  description: string
}

const smsTemplates: SMSTemplate[] = [
  {
    id: 'event-sms',
    name: 'Event Invitation',
    category: 'Event',
    charCount: 155,
    description: 'Concise event invitation under 160 characters',
    template: 'Hi {{name}}! Join {{eventName}} on {{date}} at {{time}}, {{venue}}. {{committee}} invites you. RSVP: {{contact}}',
    variables: ['name', 'eventName', 'date', 'time', 'venue', 'committee', 'contact']
  },
  {
    id: 'reminder-sms',
    name: 'Event Reminder',
    category: 'Reminder',
    charCount: 145,
    description: 'Event reminder message',
    template: 'Reminder: {{eventName}} tomorrow {{date}} at {{time}}, {{venue}}. Dont miss it! -{{committee}}',
    variables: ['eventName', 'date', 'time', 'venue', 'committee']
  },
  {
    id: 'workshop-sms',
    name: 'Workshop Alert',
    category: 'Workshop',
    charCount: 158,
    description: 'Workshop notification with registration',
    template: 'Workshop: {{eventName}} on {{date}} at {{time}}. Venue: {{venue}}. Fee: {{fee}}. Register: {{link}} -{{organizer}}',
    variables: ['eventName', 'date', 'time', 'venue', 'fee', 'link', 'organizer']
  },
  {
    id: 'urgent-sms',
    name: 'Urgent Notice',
    category: 'Notice',
    charCount: 145,
    description: 'Urgent notification message',
    template: 'URGENT: {{subject}}. Date: {{date}} Time: {{time}}. Action: {{action}}. Contact: {{contact}} -{{authority}}',
    variables: ['subject', 'date', 'time', 'action', 'contact', 'authority']
  },
  {
    id: 'fest-sms',
    name: 'Cultural Fest',
    category: 'Festival',
    charCount: 152,
    description: 'Cultural fest invitation',
    template: '🎉{{festName}} starts {{date}}! {{venue}}. Prizes worth {{prizes}}. Register: {{link}} Dont miss! -{{committee}}',
    variables: ['festName', 'date', 'venue', 'prizes', 'link', 'committee']
  },
  {
    id: 'result-sms',
    name: 'Result Alert',
    category: 'Academic',
    charCount: 149,
    description: 'Result announcement message',
    template: 'Results declared for {{exam}}! Check: {{link}} Roll: {{roll}} Pass: {{pass}}. Last date: {{deadline}} -{{dept}}',
    variables: ['exam', 'link', 'roll', 'pass', 'deadline', 'dept']
  },
  {
    id: 'guest-lecture-sms',
    name: 'Guest Lecture',
    category: 'Academic',
    charCount: 156,
    description: 'Guest lecture notification',
    template: 'Guest Lecture: {{topic}} by {{speaker}} from {{company}}. {{date}} {{time}} at {{venue}}. Dont miss! -{{dept}}',
    variables: ['topic', 'speaker', 'company', 'date', 'time', 'venue', 'dept']
  }
]

export async function GET() {
  return NextResponse.json({
    success: true,
    templates: smsTemplates,
    totalTemplates: smsTemplates.length,
    note: 'All templates are optimized for 160 character SMS limit'
  })
}
