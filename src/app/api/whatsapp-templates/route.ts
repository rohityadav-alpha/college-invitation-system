import { NextRequest, NextResponse } from 'next/server'

// Pre-defined WhatsApp message templates
const whatsappTemplates = [
  {
    id: 'event-invitation',
    name: 'Event Invitation',
    category: 'Event',
    template: `🎉 *{{name}}*, You're Invited!

The {{committee}} cordially invites you to:

📍 *Event:* {{eventName}}
📅 *Date:* {{date}}
⏰ *Time:* {{time}}
🏢 *Venue:* {{venue}}

{{description}}

Please confirm your attendance by replying to this message.

Looking forward to seeing you there! ✨`,
    variables: ['name', 'committee', 'eventName', 'date', 'time', 'venue', 'description']
  },
  {
    id: 'workshop-reminder',
    name: 'Workshop Reminder',
    category: 'Workshop',
    template: `🔔 *Reminder: {{eventName}}*

Hi {{name}}! 👋

This is a friendly reminder about the upcoming workshop:

🎯 *Topic:* {{eventName}}
📅 *Date:* {{date}}
⏰ *Time:* {{time}}
📍 *Venue:* {{venue}}

📋 *What to bring:*
- Notebook and pen
- Laptop (if available)
- Enthusiasm to learn!

See you there! 🚀`,
    variables: ['name', 'eventName', 'date', 'time', 'venue']
  },
  {
    id: 'seminar-announcement',
    name: 'Seminar Announcement',
    category: 'Seminar',
    template: `🎓 *{{name}}*, Join Our Seminar!

The {{committee}} presents:

*"{{eventName}}"*

🗣️ *Speaker:* {{speaker}}
📅 *Date:* {{date}}
⏰ *Time:* {{time}}
📍 *Venue:* {{venue}}

🎯 *Key Topics:*
{{topics}}

This seminar is perfect for students interested in {{field}}.

Limited seats available! 
Reply "CONFIRM" to secure your spot.

Best regards,
{{committee}} 📚`,
    variables: ['name', 'committee', 'eventName', 'speaker', 'date', 'time', 'venue', 'topics', 'field']
  },
  {
    id: 'fest-invitation',
    name: 'Cultural Fest Invitation',
    category: 'Festival',
    template: `🎊 *{{name}}*, Festival Time!

You're invited to our grand cultural fest!

🎭 *Event:* {{eventName}}
📅 *Dates:* {{date}}
⏰ *Time:* {{time}}
🏟️ *Venue:* {{venue}}

🎯 *Highlights:*
• Cultural performances
• Food stalls
• Fun games & prizes
• Live music
• And much more!

Bring your friends and family! 
Entry is FREE for all students.

{{additionalInfo}}

Can't wait to celebrate with you! 🎉`,
    variables: ['name', 'eventName', 'date', 'time', 'venue', 'additionalInfo']
  },
  {
    id: 'meeting-notice',
    name: 'Meeting Notice',
    category: 'Meeting',
    template: `📋 *Meeting Notice*

Dear {{name}},

You're requested to attend an important meeting:

🏢 *Purpose:* {{purpose}}
📅 *Date:* {{date}}
⏰ *Time:* {{time}}
📍 *Venue:* {{venue}}

📝 *Agenda:*
{{agenda}}

Please confirm your attendance.

Thank you,
{{committee}} 📞`,
    variables: ['name', 'purpose', 'date', 'time', 'venue', 'agenda', 'committee']
  },
  {
    id: 'result-announcement',
    name: 'Result Announcement',
    category: 'Result',
    template: `🏆 *Congratulations {{name}}!*

We're excited to announce the results of {{eventName}}:

🥇 *Your Achievement:* {{achievement}}
🎯 *Category:* {{category}}

The {{committee}} is proud of your outstanding performance!

🎊 *Prize Distribution:*
📅 *Date:* {{date}}
⏰ *Time:* {{time}}  
📍 *Venue:* {{venue}}

Please attend the ceremony to collect your prize.

Once again, congratulations! 🌟`,
    variables: ['name', 'eventName', 'achievement', 'category', 'committee', 'date', 'time', 'venue']
  },
  {
    id: 'deadline-reminder',
    name: 'Deadline Reminder',
    category: 'Reminder',
    template: `⏰ *Important Deadline Reminder*

Hi {{name}}! 👋

This is a reminder about an upcoming deadline:

📝 *Task:* {{task}}
📅 *Deadline:* {{deadline}}
⏰ *Time Remaining:* {{timeLeft}}

📋 *Requirements:*
{{requirements}}

Please submit your {{task}} before the deadline.

For any queries, contact: {{contact}}

Best regards,
{{committee}} 📧`,
    variables: ['name', 'task', 'deadline', 'timeLeft', 'requirements', 'contact', 'committee']
  },
  {
    id: 'welcome-message',
    name: 'Welcome Message',
    category: 'Welcome',
    template: `🎉 *Welcome {{name}}!*

The {{committee}} warmly welcomes you to {{collegeName}}!

We're excited to have you as part of our community. Here's what's next:

📍 *Orientation Details:*
📅 *Date:* {{date}}
⏰ *Time:* {{time}}
🏢 *Venue:* {{venue}}

🎯 *What to expect:*
• Campus tour
• Meet your mentors
• Course information
• Q&A session

Looking forward to meeting you! 

Welcome aboard! 🚀`,
    variables: ['name', 'committee', 'collegeName', 'date', 'time', 'venue']
  }
]

export async function GET() {
  return NextResponse.json({
    success: true,
    templates: whatsappTemplates
  })
}

export async function POST(request: NextRequest) {
  try {
    const { templateId, variables } = await request.json()
    
    const template = whatsappTemplates.find(t => t.id === templateId)
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Replace variables in template
    let message = template.template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      message = message.replace(regex, value as string)
    }

    return NextResponse.json({
      success: true,
      message,
      template: template
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process template: ' + error.message },
      { status: 500 }
    )
  }
}
