// src/lib/email.ts

import sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
} else {
  console.warn('SENDGRID_API_KEY not found in environment variables')
}

export async function sendBulkEmails(
  emails: { to: string; name: string }[],
  subject: string,
  content: string
) {
  // Validation checks
  if (!process.env.SENDGRID_API_KEY) {
    return {
      success: false,
      message: 'SendGrid API key not configured',
      error: 'SENDGRID_API_KEY missing'
    }
  }

  if (!process.env.SENDGRID_FROM_EMAIL) {
    return {
      success: false,
      message: 'SendGrid from email not configured',
      error: 'SENDGRID_FROM_EMAIL missing'
    }
  }

  if (!emails.length) {
    return {
      success: false,
      message: 'No emails to send',
      error: 'Empty emails array'
    }
  }

  const messages = emails.map(({ to, name }) => ({
    to: to.trim(),
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: 'College Invitation System'
    },
    subject: subject.trim(),
    html: content.replace(/{{name}}/g, name || 'Dear Recipient'),
    text: content.replace(/{{name}}/g, name || 'Dear Recipient').replace(/<[^>]*>/g, ''), // Strip HTML for text version
  }))

  try {
    console.log(`Sending ${emails.length} emails via SendGrid...`)
    const response = await sgMail.send(messages)
    
    console.log(`✅ Successfully sent ${emails.length} emails`)
    return {
      success: true,
      message: `${emails.length} emails sent successfully`,
      data: response,
      count: emails.length
    }
  } catch (error: any) {
    console.error('❌ SendGrid Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.body || 'No response body'
    })
    
    return {
      success: false,
      message: 'Failed to send emails',
      error: error.message,
      details: error.response?.body
    }
  }
}

export async function sendTestEmail(to: string, name?: string) {
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    return {
      success: false,
      message: 'SendGrid not configured',
      error: 'Missing API key or from email'
    }
  }

  const msg = {
    to: to.trim(),
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: 'College Invitation System'
    },
    subject: 'Test Email - College Invitation System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Test Email Successful!</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Your email service is working perfectly! ✅</p>
        <p>This test email confirms that:</p>
        <ul>
          <li>SendGrid API is properly configured</li>
          <li>Email delivery is functioning</li>
          <li>Your invitation system is ready to use</li>
        </ul>
        <p>Best regards,<br>College Invitation System</p>
      </div>
    `,
    text: `Test Email Successful!\n\nHello ${name || 'there'},\n\nYour email service is working perfectly! ✅\n\nThis test email confirms that SendGrid API is properly configured and email delivery is functioning.\n\nBest regards,\nCollege Invitation System`
  }

  try {
    console.log('Sending test email to:', to)
    await sgMail.send(msg)
    console.log('✅ Test email sent successfully')
    
    return {
      success: true,
      message: 'Test email sent successfully',
      recipient: to
    }
  } catch (error: any) {
    console.error('❌ Test Email Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.body
    })
    
    return {
      success: false,
      message: 'Test email failed',
      error: error.message,
      details: error.response?.body
    }
  }
}

export async function sendSingleEmail(
  to: string,
  subject: string,
  content: string,
  name?: string
) {
  return sendBulkEmails([{ to, name: name || 'Recipient' }], subject, content)
}
