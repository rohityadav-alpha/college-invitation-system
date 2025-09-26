// src/app/api/webhooks/mailersend/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHmac, timingSafeEqual } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const signature = request.headers.get('x-signature')
    
    // Verify webhook signature (Security)
    if (!verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse JSON after verification
    const webhookData = JSON.parse(body)
    
    console.log('✅ Verified MailerSend Webhook received:', webhookData.type)
    
    const { type, data } = webhookData
    
    // Handle ALL your selected events
    switch (type) {
      // Basic email events
      case 'activity.sent':
        await updateEmailStatus(data.email.message_id, 'sent', data.timestamp)
        break
        
      case 'activity.delivered':
        await updateEmailStatus(data.email.message_id, 'delivered', data.timestamp)
        break
        
      case 'activity.opened':
        await updateEmailStatus(data.email.message_id, 'opened', data.timestamp)
        break
        
      case 'activity.clicked':
        await updateEmailStatus(data.email.message_id, 'clicked', data.timestamp)
        break
        
      // Bounce events
      case 'activity.soft_bounced':
        await updateEmailStatus(data.email.message_id, 'soft_bounced', data.timestamp, `Soft bounce: ${data.reason || 'Temporary delivery issue'}`)
        break
        
      case 'activity.hard_bounced':
        await updateEmailStatus(data.email.message_id, 'failed', data.timestamp, `Hard bounce: ${data.reason || 'Permanent delivery failure'}`)
        break
        
      // Unique events (for better analytics)
      case 'activity.opened_unique':
        await updateEmailStatus(data.email.message_id, 'opened_unique', data.timestamp)
        await incrementUniqueCounter(data.email.message_id, 'unique_opens')
        break
        
      case 'activity.clicked_unique':
        await updateEmailStatus(data.email.message_id, 'clicked_unique', data.timestamp)
        await incrementUniqueCounter(data.email.message_id, 'unique_clicks')
        break
        
      // Survey/Form events
      case 'activity.survey_opened':
        await updateEmailStatus(data.email.message_id, 'survey_opened', data.timestamp)
        break
        
      // System events
      case 'inbound_forward.failed':
        console.log('Inbound forward failed:', data)
        break
        
      case 'bulk_email.completed':
        console.log('Bulk email campaign completed:', data)
        await handleBulkCompletion(data)
        break
        
      default:
        console.log('Unhandled webhook type:', type)
        console.log('Data:', data)
    }
    
    return NextResponse.json({ 
      status: 'success',
      processed: type,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}

// Verify webhook signature for security
function verifyWebhookSignature(body: string, signature: string | null): boolean {
  try {
    // For development, you can temporarily skip verification
    if (process.env.NODE_ENV === 'development' && !signature) {
      console.warn('⚠️ Development mode: Skipping signature verification')
      return true
    }
    
    if (!signature || !process.env.MAILERSEND_WEBHOOK_SECRET) {
      console.warn('⚠️ No signature or webhook secret found')
      return false
    }

    // MailerSend signature verification
    const expectedSignature = createHmac('sha256', process.env.MAILERSEND_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    const receivedSignature = signature.replace(/^sha256=/, '')

    return timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    )
    
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// Update email status in database
async function updateEmailStatus(
  messageId: string, 
  status: string, 
  timestamp?: string,
  errorMessage?: string
) {
  try {
    const emailLog = await prisma.emailLog.findFirst({
      where: { messageId }
    })
    
    if (emailLog) {
      const updateData: any = { status }
      
      // Set timestamps based on event type
      if (status === 'delivered' && timestamp) {
        updateData.deliveredAt = new Date(timestamp)
      }
      if (['opened', 'opened_unique'].includes(status) && timestamp) {
        updateData.openedAt = new Date(timestamp)
      }
      if (['clicked', 'clicked_unique'].includes(status) && timestamp) {
        updateData.clickedAt = new Date(timestamp)
      }
      if (errorMessage) {
        updateData.errorMessage = errorMessage
      }
      
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: updateData
      })
      
      console.log(`✅ Updated email ${messageId} to ${status}`)
    } else {
      console.warn(`⚠️ Email log not found for message ID: ${messageId}`)
    }
  } catch (error) {
    console.error('❌ Database update error:', error)
  }
}

// Handle unique counters (for advanced analytics)
async function incrementUniqueCounter(messageId: string, counterType: string) {
  try {
    // You can implement unique counters logic here
    // For now, just log it
    console.log(`📊 Unique event: ${counterType} for ${messageId}`)
  } catch (error) {
    console.error('Counter update error:', error)
  }
}

// Handle bulk email completion
async function handleBulkCompletion(data: any) {
  try {
    console.log('📈 Bulk email campaign completed:')
    console.log('- Campaign ID:', data.campaign_id || 'N/A')
    console.log('- Total emails:', data.total_emails || 'N/A')
    console.log('- Completion time:', data.completed_at || new Date().toISOString())
    
    // You can add logic to update campaign status in database
    // if (data.campaign_id) {
    //   await prisma.campaign.update({
    //     where: { externalId: data.campaign_id },
    //     data: { status: 'completed', completedAt: new Date() }
    //   })
    // }
  } catch (error) {
    console.error('Bulk completion handler error:', error)
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'MailerSend webhook endpoint is active',
    supportedEvents: [
      'activity.sent',
      'activity.delivered', 
      'activity.opened',
      'activity.clicked',
      'activity.soft_bounced',
      'activity.hard_bounced',
      'activity.opened_unique',
      'activity.clicked_unique',
      'activity.survey_opened',
      'inbound_forward.failed',
      'bulk_email.completed'
    ],
    timestamp: new Date().toISOString()
  })
}
