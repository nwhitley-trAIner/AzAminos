import type { PaymentRequest, PaymentResult } from '@/types'
import type { PaymentProcessor } from './index'
import { createHmac } from 'crypto'

/**
 * Coinbase Commerce payment processor for cryptocurrency payments.
 *
 * Configure via:
 *   COINBASE_COMMERCE_API_KEY
 *   COINBASE_COMMERCE_WEBHOOK_SECRET
 *
 * Flow:
 *   1. charge() creates a Coinbase Commerce charge
 *   2. Returns a hosted checkout URL for the customer
 *   3. Coinbase sends webhook on payment confirmation
 *   4. verifyWebhook() validates the webhook signature
 */
export class CoinbaseProcessor implements PaymentProcessor {
  name = 'Coinbase Commerce'

  private apiKey: string
  private webhookSecret: string
  private endpoint = 'https://api.commerce.coinbase.com'

  constructor() {
    this.apiKey = process.env.COINBASE_COMMERCE_API_KEY || ''
    this.webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || ''

    if (!this.apiKey) {
      console.warn(
        'Coinbase Commerce credentials not configured. Set COINBASE_COMMERCE_API_KEY.'
      )
    }
  }

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Coinbase Commerce credentials not configured',
      }
    }

    try {
      const payload = {
        name: `Order ${request.orderId}`,
        description: `AZ Aminos Order ${request.orderId}`,
        pricing_type: 'fixed_price',
        local_price: {
          amount: request.amount.toFixed(2),
          currency: request.currency.toUpperCase(),
        },
        metadata: {
          order_id: request.orderId,
          customer_email: request.customerEmail,
        },
        redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${request.orderId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?cancelled=true`,
      }

      const response = await fetch(`${this.endpoint}/charges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': this.apiKey,
          'X-CC-Version': '2018-03-22',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.data?.id) {
        return {
          success: true,
          transactionId: data.data.id,
          processorResponse: {
            chargeId: data.data.id,
            hostedUrl: data.data.hosted_url,
            expiresAt: data.data.expires_at,
          },
        }
      }

      return {
        success: false,
        error: data.error?.message || 'Failed to create crypto charge',
        processorResponse: data,
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Crypto payment processing failed',
      }
    }
  }

  async refund(_transactionId: string): Promise<PaymentResult> {
    // Coinbase Commerce doesn't support programmatic refunds
    // Crypto refunds must be handled manually
    return {
      success: false,
      error:
        'Crypto refunds must be processed manually. Send funds directly to the customer wallet.',
    }
  }

  verifyWebhook(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false

    const hmac = createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex')

    return hmac === signature
  }
}
