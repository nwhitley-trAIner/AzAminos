import type { PaymentRequest, PaymentResult } from '@/types'
import type { PaymentProcessor } from './index'

/**
 * Mock payment processor for development and testing.
 * Always succeeds unless card number ends in 0000 (simulates decline).
 */
export class MockProcessor implements PaymentProcessor {
  name = 'Mock Processor'

  async charge(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 800))

    // Simulate decline for cards ending in 0000
    if (request.card?.number?.endsWith('0000')) {
      return {
        success: false,
        error: 'Card declined (mock: card ending in 0000)',
      }
    }

    // Simulate failure for amounts over $10,000
    if (request.amount > 10000) {
      return {
        success: false,
        error: 'Amount exceeds limit (mock: > $10,000)',
      }
    }

    const transactionId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    return {
      success: true,
      transactionId,
      processorResponse: {
        processor: 'mock',
        amount: request.amount,
        currency: request.currency,
        orderId: request.orderId,
        timestamp: new Date().toISOString(),
      },
    }
  }

  async refund(
    transactionId: string,
    amount?: number
  ): Promise<PaymentResult> {
    await new Promise((r) => setTimeout(r, 500))

    return {
      success: true,
      transactionId: `mock_refund_${Date.now()}`,
      processorResponse: {
        originalTransaction: transactionId,
        refundAmount: amount,
        timestamp: new Date().toISOString(),
      },
    }
  }
}
