import type { PaymentRequest, PaymentResult } from '@/types'
import type { PaymentProcessor } from './index'

/**
 * Authorize.net payment processor.
 *
 * Configure via environment variables:
 *   AUTHORIZE_NET_API_LOGIN_ID
 *   AUTHORIZE_NET_TRANSACTION_KEY
 *   AUTHORIZE_NET_SANDBOX (true/false)
 *
 * When the user gets approved by a high-risk provider that routes through
 * Authorize.net, they just fill in the .env vars and switch
 * PAYMENT_PROCESSOR=authorize_net.
 */
export class AuthorizeNetProcessor implements PaymentProcessor {
  name = 'Authorize.net'

  private apiLoginId: string
  private transactionKey: string
  private endpoint: string

  constructor() {
    this.apiLoginId = process.env.AUTHORIZE_NET_API_LOGIN_ID || ''
    this.transactionKey = process.env.AUTHORIZE_NET_TRANSACTION_KEY || ''
    this.endpoint =
      process.env.AUTHORIZE_NET_SANDBOX === 'true'
        ? 'https://apitest.authorize.net/xml/v1/request.api'
        : 'https://api.authorize.net/xml/v1/request.api'

    if (!this.apiLoginId || !this.transactionKey) {
      console.warn(
        'Authorize.net credentials not configured. Set AUTHORIZE_NET_API_LOGIN_ID and AUTHORIZE_NET_TRANSACTION_KEY.'
      )
    }
  }

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.apiLoginId || !this.transactionKey) {
      return {
        success: false,
        error: 'Authorize.net credentials not configured',
      }
    }

    try {
      const payload = {
        createTransactionRequest: {
          merchantAuthentication: {
            name: this.apiLoginId,
            transactionKey: this.transactionKey,
          },
          transactionRequest: {
            transactionType: 'authCaptureTransaction',
            amount: request.amount.toFixed(2),
            payment: {
              creditCard: {
                cardNumber: request.card?.number,
                expirationDate: request.card?.exp,
                cardCode: request.card?.cvv,
              },
            },
            order: {
              invoiceNumber: request.orderId,
            },
            billTo: request.billingAddress
              ? {
                  address: request.billingAddress.line1,
                  city: request.billingAddress.city,
                  state: request.billingAddress.state,
                  zip: request.billingAddress.zip,
                  country: request.billingAddress.country,
                }
              : undefined,
          },
        },
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      const txResponse = data.transactionResponse

      if (txResponse?.responseCode === '1') {
        return {
          success: true,
          transactionId: txResponse.transId,
          processorResponse: data,
        }
      }

      return {
        success: false,
        error:
          txResponse?.errors?.[0]?.errorText ||
          'Transaction declined',
        processorResponse: data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      }
    }
  }

  async refund(
    transactionId: string,
    amount?: number
  ): Promise<PaymentResult> {
    if (!this.apiLoginId || !this.transactionKey) {
      return {
        success: false,
        error: 'Authorize.net credentials not configured',
      }
    }

    try {
      const payload = {
        createTransactionRequest: {
          merchantAuthentication: {
            name: this.apiLoginId,
            transactionKey: this.transactionKey,
          },
          transactionRequest: {
            transactionType: 'refundTransaction',
            amount: amount?.toFixed(2),
            refTransId: transactionId,
          },
        },
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      const txResponse = data.transactionResponse

      if (txResponse?.responseCode === '1') {
        return {
          success: true,
          transactionId: txResponse.transId,
          processorResponse: data,
        }
      }

      return {
        success: false,
        error: txResponse?.errors?.[0]?.errorText || 'Refund failed',
        processorResponse: data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed',
      }
    }
  }
}
