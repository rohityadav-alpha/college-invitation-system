import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json()

    if (!process.env.HTTPSMS_API_KEY || !process.env.HTTPSMS_PHONE_ID) {
      return NextResponse.json(
        { error: 'httpSMS not configured. Setup your Android phone first.' },
        { status: 500 }
      )
    }

    // Format phone number
    let formattedPhone = phoneNumber.replace(/\D/g, '')
    if (formattedPhone.length === 10) {
      formattedPhone = '+91' + formattedPhone
    }

    console.log('📱 Testing SMS via your Android phone:', {
      from: process.env.HTTPSMS_PHONE_ID,
      to: formattedPhone,
      message: message.substring(0, 50)
    })

    const response = await fetch('https://api.httpsms.com/v1/messages/send', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.HTTPSMS_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: message || 'Hello! 🎓 Test SMS from College Invitation System via your Android phone using httpSMS.',
        from: process.env.HTTPSMS_PHONE_ID!,
        to: formattedPhone
      })
    })

    const result = await response.json()
    console.log('httpSMS Test Response:', result)

    if (response.ok && result.id) {
      return NextResponse.json({
        success: true,
        message: 'Test SMS sent successfully from your Android phone!',
        messageId: result.id,
        from: process.env.HTTPSMS_PHONE_ID,
        to: formattedPhone,
        provider: 'httpSMS via Your Phone',
        cost: '₹0 (using your data plan quota)'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.message || 'Phone SMS failed',
        details: result
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ Phone SMS test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
