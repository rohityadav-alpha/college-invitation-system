import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { 
      eventType, 
      eventName, 
      committeeName, 
      venue, 
      date, 
      time, 
      urgency,
      includeContact
    } = await request.json()

    if (!eventType || !eventName) {
      return NextResponse.json(
        { error: 'Event type and name are required' },
        { status: 400 }
      )
    }

    const prompt = `
Create a professional SMS message for a college event. Critical requirements:

Event Details:
- Committee: ${committeeName}
- Event Type: ${eventType}
- Event Name: ${eventName}
- Date: ${date || 'TBD'}
- Time: ${time || 'TBD'}
- Venue: ${venue || 'TBD'}
- Urgency Level: ${urgency || 'Normal'}
- Include Contact: ${includeContact ? 'Yes' : 'No'}

STRICT Requirements:
1. MAXIMUM 500 characters including spaces
2. Use Dear {{name}} for personalization
3. Include essential details
4. Use abbreviations where appropriate (eg. "Tmrw" for tomorrow)
5. ${urgency === 'High' ? 'Start with "URGENT:" or "ALERT:"' : 'Keep tone friendly'}
6. ${includeContact ? 'Include contact placeholder {{contact}}' : 'Skip contact details'}
7. Use maximum punctuation (commas, periods) to enhance readability
8. Make it actionable with clear next steps
9. Include committee name as signature if space allows
10. Prioritize: Event name, Date, Time, Venue (in this order)
11. Use {{url}} for RSVP link if needed

Generate ONLY the SMS text, no additional content. Count characters carefully!
    `

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const smsMessage = response.text()

    // Validate character count
    if (smsMessage.length > 500) {
      return NextResponse.json(
        { error: `Generated SMS is ${smsMessage.length} characters. Must be ≤500. Please try with shorter event details.` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: smsMessage,
      characterCount: smsMessage.length,
      charactersRemaining: 500 - smsMessage.length,
      eventDetails: {
        eventType,
        eventName,
        committeeName,
        venue,
        date,
        time
      },
      generatedAt: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('SMS generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate SMS: ' + error.message },
      { status: 500 }
    )
  }
}
