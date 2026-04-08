import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getPaymentProcessor } from '@/lib/payment'

/**
 * Webhook endpoint for payment processor callbacks.
 * Handles payment confirmation, especially for async flows like crypto.
 */
export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-cc-webhook-signature') || ''

    const processor = getPaymentProcessor()

    // Verify webhook signature if processor supports it
    if (processor.verifyWebhook) {
      const valid = processor.verifyWebhook(body, signature)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const payload = JSON.parse(body)

    // Handle Coinbase Commerce webhook events
    if (payload.event?.type === 'charge:confirmed') {
      const orderId = payload.event.data?.metadata?.order_id
      if (orderId) {
        await prisma.order.updateMany({
          where: { orderNumber: orderId },
          data: {
            paymentStatus: 'CAPTURED',
            status: 'CONFIRMED',
          },
        })
      }
    }

    // Handle generic payment confirmation
    if (payload.transactionId && payload.status === 'completed') {
      await prisma.order.updateMany({
        where: { paymentId: payload.transactionId },
        data: {
          paymentStatus: 'CAPTURED',
          status: 'CONFIRMED',
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
