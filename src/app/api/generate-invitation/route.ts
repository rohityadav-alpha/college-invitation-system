import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { eventType, eventName, committeeName, venue, date, time, additionalInfo } = await request.json()

    // Enhanced prompt with rich content requirements
    const prompt = `Create a professional, visually appealing HTML email invitation with modern styling and rich content.

Event Details:
- Committee: ${committeeName}
- Event Type: ${eventType}
- Event Name: ${eventName}
- Date: ${date}
- Time: ${time}
- Venue: ${venue}
- Additional Information: ${additionalInfo || 'None'}

Requirements:
1. Use modern gradient backgrounds and attractive colors
2. Include proper spacing, shadows, and border-radius
3. Add icons/emojis for visual appeal
4. Use {{name}} placeholder for personalization
5. Create an attractive call-to-action button
6. Make it mobile-friendly with table-based layout
7. Include professional footer with committee branding
8. Use vibrant yet professional color scheme

IMPORTANT - Content Structure:
- Start with "Dear {{name}}," greeting
- Add engaging introduction: "The ${committeeName} cordially invites you to an exciting ${eventType}:"
- Include rich description paragraph: "Get ready to dive deep into [relevant content about the event]. This ${eventType.toLowerCase()} will cover [mention what to expect]. Whether you're a seasoned enthusiast or just curious, there's something amazing for everyone!"
- Add benefits and excitement about attending
- Include clear event details in structured format
- End with encouraging call-to-action

Generate only the HTML code with inline CSS styling:`

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    let generatedContent = response.text()

    // Clean any remaining markdown
    generatedContent = generatedContent.replace(/``````/g, '').trim()

    return NextResponse.json({
      success: true,
      content: generatedContent,
      subject: `Invitation: ${eventName} by ${committeeName}`
    })

  } catch (error) {
    console.error('AI Generation Error:', error)
    
    const { eventName, committeeName, eventType, date, time, venue, additionalInfo } = await request.json()
    
    // Enhanced fallback with rich content and better styling
    const fallbackHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invitation to ${eventName}</title>
</head>
<body style="font-family: 'Arial', sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0;">
    <tr>
      <td>
        <table align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="background: #ffffff; margin: 0 auto; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 40px 30px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${committeeName}</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">✨ Cordially Invites You ✨</p>
            </td>
          </tr>
          
          <!-- Event Title -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);">
              <h2 style="color: #2d3748; margin: 0 0 15px 0; font-size: 28px; font-weight: bold;">${eventName}</h2>
              <p style="color: #667eea; margin: 0; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">🎉 ${eventType} Experience 🎉</p>
            </td>
          </tr>
          
          <!-- Rich Content Section -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #2d3748; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Dear {{name}},</p>
              
              <p style="color: #4a5568; margin: 0 0 20px 0; font-size: 16px; line-height: 1.7; font-weight: 500;">
                The <strong>${committeeName}</strong> cordially invites you to an exciting <strong>${eventType}</strong>:
              </p>
              
              <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e6f3ff 100%); padding: 25px; border-radius: 12px; border-left: 5px solid #667eea; margin: 20px 0;">
                <p style="color: #2d3748; margin: 0 0 15px 0; font-size: 16px; line-height: 1.7; font-weight: 600;">
                  Get ready to dive deep into the exciting world of <em>${eventName.toLowerCase()}</em>! 🚀
                </p>
                <p style="color: #4a5568; margin: 0 0 15px 0; font-size: 15px; line-height: 1.6;">
                  This ${eventType.toLowerCase()} will cover fascinating topics, interactive sessions, hands-on activities, and amazing networking opportunities. Whether you're a seasoned enthusiast or just curious about the subject, there's something incredible waiting for everyone!
                </p>
                <p style="color: #4a5568; margin: 0; font-size: 15px; line-height: 1.6;">
                  Join us for an unforgettable experience filled with learning, innovation, fun, and the chance to connect with like-minded individuals. Your participation will make this event even more special! 🌟
                </p>
              </div>

              ${additionalInfo ? `<div style="background: #fff5f5; border: 1px solid #fed7d7; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h4 style="color: #c53030; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">📋 Additional Information:</h4>
                <p style="color: #742a2a; margin: 0; font-size: 15px; line-height: 1.6;">${additionalInfo}</p>
              </div>` : ''}
            </td>
          </tr>
          
          <!-- Event Details Card -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%); padding: 30px; border-radius: 12px; border: 2px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <h3 style="color: #2d3748; margin: 0 0 25px 0; font-size: 20px; text-align: center; font-weight: bold;">📅 Event Details</h3>
                <table width="100%" cellpadding="12" cellspacing="0">
                  ${date ? `<tr>
                    <td style="font-weight: bold; color: #4a5568; width: 140px; font-size: 16px; padding: 8px 0;">📅 Date:</td>
                    <td style="color: #2d3748; font-size: 16px; font-weight: 600; padding: 8px 0;">${date}</td>
                  </tr>` : ''}
                  ${time ? `<tr>
                    <td style="font-weight: bold; color: #4a5568; width: 140px; font-size: 16px; padding: 8px 0;">⏰ Time:</td>
                    <td style="color: #2d3748; font-size: 16px; font-weight: 600; padding: 8px 0;">${time}</td>
                  </tr>` : ''}
                  ${venue ? `<tr>
                    <td style="font-weight: bold; color: #4a5568; width: 140px; font-size: 16px; padding: 8px 0;">📍 Venue:</td>
                    <td style="color: #2d3748; font-size: 16px; font-weight: 600; padding: 8px 0;">${venue}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="font-weight: bold; color: #4a5568; width: 140px; font-size: 16px; padding: 8px 0;">🎪 Event Type:</td>
                    <td style="color: #2d3748; font-size: 16px; font-weight: 600; padding: 8px 0;">${eventType}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; color: #4a5568; width: 140px; font-size: 16px; padding: 8px 0;">👥 Organized by:</td>
                    <td style="color: #2d3748; font-size: 16px; font-weight: 600; padding: 8px 0;">${committeeName}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Call to Action -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4); text-transform: uppercase; letter-spacing: 1px;">
                🎯 Mark Your Calendar! 🎯
              </a>
              <p style="margin: 20px 0 0 0; color: #666; font-size: 15px; line-height: 1.5;">
                Don't miss out on this incredible opportunity!<br>
                <strong>We can't wait to see you there! 🚀</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%); color: white; text-align: center; padding: 30px;">
              <h4 style="margin: 0 0 10px 0; font-size: 20px; font-weight: bold;">${committeeName}</h4>
              <p style="margin: 0 0 15px 0; opacity: 0.9; font-size: 16px;">✨ Creating Unforgettable Memories ✨</p>
              <p style="margin: 0; font-size: 13px; opacity: 0.8; line-height: 1.4;">
                Contact: committee@college.edu | Follow us for more amazing events!<br>
                © 2025 ${committeeName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    return NextResponse.json({
      success: true,
      content: fallbackHTML,
      subject: `Invitation: ${eventName} by ${committeeName}`,
      note: 'Enhanced rich content template used'
    })
  }
}
