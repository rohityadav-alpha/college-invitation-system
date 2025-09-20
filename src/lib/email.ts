import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendBulkEmails(
  emails: { to: string; name: string }[],
  subject: string,
  content: string
) {
  const messages = emails.map(({ to, name }) => ({
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html: content.replace("{{name}}", name),
  }));

  try {
    const response = await sgMail.send(messages);
    return {
      success: true,
      message: `${emails.length} emails sent successfully`,
      data: response,
    };
  } catch (error: any) {
    console.error("SendGrid Error:", error.response?.body || error);
    return {
      success: false,
      message: "Failed to send emails",
      error: error.message,
    };
  }
}

export async function sendTestEmail(to: string) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: "Test Email - College Invitation System",
    html: "<h1>Test Email</h1><p>Your email service is working perfectly! ✅</p>",
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: "Test email sent successfully" };
  } catch (error: any) {
    console.error("SendGrid Error:", error.response?.body || error);
    return {
      success: false,
      message: "Test email failed",
      error: error.message,
    };
  }
}
