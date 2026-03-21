// src/lib/email.ts

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporterInstance: Transporter | null = null;

// Reusable Transporter (Singleton pattern)
export function createTransporter(): Transporter {
  if (transporterInstance) {
    return transporterInstance;
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn('GMAIL_USER or GMAIL_APP_PASSWORD not found in environment variables');
  }

  transporterInstance = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporterInstance;
}

export async function sendBulkEmails(
  recipients: { to: string; name: string }[],
  subject: string,
  content: string
) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return {
      success: false,
      message: 'Gmail config missing',
      error: 'Gmail credentials not configured'
    };
  }

  if (!recipients || recipients.length === 0) {
    return {
      success: false,
      message: 'No recipients provided',
      error: 'Empty emails array'
    };
  }

  const transporter = createTransporter();
  const results: { email: string; status: "sent" | "failed"; error?: string }[] = [];
  
  console.log(`Sending ${recipients.length} emails via Gmail...`);

  // Using Promise.all for parallel sending
  await Promise.all(recipients.map(async (recipient) => {
    const personalizedHtml = content.replace(/{{name}}/g, recipient.name || 'Dear Recipient');
    const plainText = personalizedHtml.replace(/<[^>]*>/g, '');

    try {
      await transporter.sendMail({
        from: `"College Invitation System" <${process.env.GMAIL_USER}>`,
        to: recipient.to.trim(),
        subject: subject.trim(),
        html: personalizedHtml,
        text: plainText
      });
      
      results.push({ email: recipient.to, status: "sent" });
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${recipient.to}:`, error.message);
      results.push({ email: recipient.to, status: "failed", error: error.message });
    }
  }));

  const failedCount = results.filter(r => r.status === 'failed').length;
  const successCount = results.length - failedCount;
  
  console.log(`✅ Sent: ${successCount} | ❌ Failed: ${failedCount}`);

  return {
    success: failedCount === 0 || successCount > 0,
    message: `${successCount} out of ${recipients.length} emails sent successfully`,
    data: results,
    count: recipients.length
  };
}

export async function sendSingleEmail(
  to: string,
  subject: string,
  content: string,
  name?: string
) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return { success: false, error: 'Gmail credentials missing' };
  }

  const transporter = createTransporter();
  const personalizedHtml = content.replace(/{{name}}/g, name || 'Recipient');
  const plainText = personalizedHtml.replace(/<[^>]*>/g, '');

  try {
    const response = await transporter.sendMail({
      from: `"College Invitation System" <${process.env.GMAIL_USER}>`,
      to: to.trim(),
      subject: subject.trim(),
      html: personalizedHtml,
      text: plainText
    });
    return { success: true, data: response };
  } catch (error: any) {
    console.error('❌ Failed to send single email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendTestEmail(to: string, name?: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return {
      success: false,
      message: 'Gmail not configured',
      error: 'Missing Gmail credentials'
    };
  }

  const transporter = createTransporter();
  const mailOptions = {
    from: `"College Invitation System" <${process.env.GMAIL_USER}>`,
    to: to.trim(),
    subject: 'Test Email - College Invitation System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Test Email Successful!</h2>
        <p>Hello ${name || 'there'},</p>
        <p>Your email service is working perfectly! ✅</p>
        <p>This test email confirms that:</p>
        <ul>
          <li>Gmail SMTP is properly configured</li>
          <li>Email delivery is functioning</li>
          <li>Your invitation system is ready to use</li>
        </ul>
        <p>Best regards,<br>College Invitation System</p>
      </div>
    `,
    text: `Test Email Successful!\n\nHello ${name || 'there'},\n\nYour email service is working perfectly! ✅\n\nThis test email confirms that Gmail SMTP is properly configured and email delivery is functioning.\n\nBest regards,\nCollege Invitation System`
  };

  try {
    console.log('Sending test email to:', to);
    const response = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully');
    
    return {
      success: true,
      message: 'Test email sent successfully',
      recipient: to,
      data: response
    };
  } catch (error: any) {
    console.error('❌ Test Email Error:', error.message);
    return {
      success: false,
      message: 'Test email failed',
      error: error.message
    };
  }
}
