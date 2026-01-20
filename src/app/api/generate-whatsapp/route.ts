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
      additionalInfo,
      messageStyle,
      targetAudience
    } = await request.json()

    if (!eventType || !eventName || !committeeName) {
      return NextResponse.json(
        { error: 'Event type, name, and committee are required' },
        { status: 400 }
      )
    }

    const prompt = `
Create a professional WhatsApp message for a college event. Follow these requirements:

Event Details:
- Committee: ${committeeName}
- Event Type: ${eventType}
- Event Name: ${eventName}
- Date: ${date || 'TBD'}
- Time: ${time || 'TBD'}
- Venue: ${venue || 'TBD'}
- Additional Info: ${additionalInfo || 'None'}
- Message Style: ${messageStyle || 'Professional'}
- Target Audience: ${targetAudience || 'Students'}

Requirements:
1. Use appropriate emojis (but not too many)
2. Keep it engaging and conversational for WhatsApp
3. Include all event details clearly
4. Use {{name}} for personalization
5. Add relevant call-to-action
6. Make it suitable for ${targetAudience || 'students'}
7. Style should be ${messageStyle || 'professional'}
8. Use WhatsApp formatting (*bold*, _italic_) appropriately
9. Keep length between 150-300 words for easy reading
10. Add contact details placeholder {{contactPerson}} and {{contactPhone}}
11. Include RSVP request
12. Make it excitement-building but informative

Generate ONLY the WhatsApp message content, no additional text or explanations.
    `

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const whatsappMessage = response.text()

    return NextResponse.json({
      success: true,
      message: whatsappMessage,
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
    console.error('WhatsApp generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate WhatsApp message: ' + error.message },
      { status: 500 }
    )
  }
}
