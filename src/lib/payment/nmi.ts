import type { PaymentRequest, PaymentResult } from '@/types'
import type { PaymentProcessor } from './index'

/**
 * NMI (Network Merchants Inc) payment processor.
 *
 * Many high-risk providers (PeptiPay, Corepay, AllayPay) can route
 * through NMI's gateway. Configure via:
 *   NMI_SECURITY_KEY
 *   NMI_SANDBOX (true/false)
 */
export class NMIProcessor implements PaymentProcessor {
  name = 'NMI'

  private securityKey: string
  private endpoint: string

  constructor() {
    this.securityKey = process.env.NMI_SECURITY_KEY || ''
    this.endpoint =
      process.env.NMI_SANDBOX === 'true'
        ? 'https://secure.nmi.com/api/transact.php'
        : 'https://secure.nmi.com/api/transact.php'

    if (!this.securityKey) {
      console.warn(
        'NMI credentials not configured. Set NMI_SECURITY_KEY.'
      )
    }
  }

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.securityKey) {
      return { success: false, error: 'NMI credentials not configured' }
    }

    try {
      const params = new URLSearchParams({
        security_key: this.securityKey,
        type: 'sale',
        amount: request.amount.toFixed(2),
        ccnumber: request.card?.number || '',
        ccexp: request.card?.exp || '',
        cvv: request.card?.cvv || '',
        orderid: request.orderId,
        email: request.customerEmail,
      })

      if (request.billingAddress) {
        params.append('address1', request.billingAddress.line1)
        params.append('city', request.billingAddress.city)
        params.append('state', request.billingAddress.state)
        params.append('zip', request.billingAddress.zip)
        params.append('country', request.billingAddress.country)
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      const text = await response.text()
      const data = Object.fromEntries(new URLSearchParams(text))

      if (data.response === '1') {
        return {
          success: true,
          transactionId: data.transactionid,
          processorResponse: data,
        }
      }

      return {
        success: false,
        error: data.responsetext || 'Transaction declined',
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
    if (!this.securityKey) {
      return { success: false, error: 'NMI credentials not configured' }
    }

    try {
      const params = new URLSearchParams({
        security_key: this.securityKey,
        type: 'refund',
        transactionid: transactionId,
      })

      if (amount) params.append('amount', amount.toFixed(2))

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })

      const text = await response.text()
      const data = Object.fromEntries(new URLSearchParams(text))

      if (data.response === '1') {
        return {
          success: true,
          transactionId: data.transactionid,
          processorResponse: data,
        }
      }

      return {
        success: false,
        error: data.responsetext || 'Refund failed',
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
