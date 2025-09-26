// src/app/api/webhooks/mailersend/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const webhookData = await request.json()
    
    console.log('MailerSend Webhook received:', webhookData)
    
    const { type, data } = webhookData
    
    switch (type) {
      case 'activity.sent':
        await updateEmailStatus(data.email.message_id, 'sent')
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
        
      case 'activity.bounced':
      case 'activity.soft_bounced':
      case 'activity.hard_bounced':
        await updateEmailStatus(data.email.message_id, 'failed', null, data.reason)
        break
        
      case 'activity.spam_complaint':
        await updateEmailStatus(data.email.message_id, 'spam', null, 'Spam complaint')
        break
    }
    
    return NextResponse.json({ status: 'success' })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

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
      
      if (status === 'delivered' && timestamp) {
        updateData.deliveredAt = new Date(timestamp)
      }
      if (status === 'opened' && timestamp) {
        updateData.openedAt = new Date(timestamp)
      }
      if (status === 'clicked' && timestamp) {
        updateData.clickedAt = new Date(timestamp)
      }
      if (errorMessage) {
        updateData.errorMessage = errorMessage
      }
      
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: updateData
      })
      
      console.log(`Updated email ${messageId} to ${status}`)
    } else {
      console.warn(`Email log not found for message ID: ${messageId}`)
    }
  } catch (error) {
    console.error('Database update error:', error)
  }
}
