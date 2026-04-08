import type { PaymentRequest, PaymentResult } from '@/types'
import { MockProcessor } from './mock'
import { AuthorizeNetProcessor } from './authorize-net'
import { NMIProcessor } from './nmi'
import { CoinbaseProcessor } from './coinbase'

/**
 * Payment Processor Interface
 *
 * All payment processors must implement this interface.
 * To add a new processor:
 *   1. Create a new file (e.g., peptipay.ts) implementing PaymentProcessor
 *   2. Add it to the PROCESSORS map below
 *   3. Add its env vars to .env.example
 *   4. Set PAYMENT_PROCESSOR=your_key in .env
 */
export interface PaymentProcessor {
  name: string
  /** Process a payment. Returns success/failure with transaction ID. */
  charge(request: PaymentRequest): Promise<PaymentResult>
  /** Refund a previous transaction. */
  refund(transactionId: string, amount?: number): Promise<PaymentResult>
  /** Verify a webhook signature from the processor. */
  verifyWebhook?(payload: string, signature: string): boolean
}

const PROCESSORS: Record<string, () => PaymentProcessor> = {
  mock: () => new MockProcessor(),
  authorize_net: () => new AuthorizeNetProcessor(),
  nmi: () => new NMIProcessor(),
  coinbase: () => new CoinbaseProcessor(),
}

let _processor: PaymentProcessor | null = null

/**
 * Get the configured payment processor.
 * Reads PAYMENT_PROCESSOR from env to determine which adapter to use.
 * Defaults to 'mock' if not set.
 */
export function getPaymentProcessor(): PaymentProcessor {
  if (_processor) return _processor

  const key = process.env.PAYMENT_PROCESSOR || 'mock'
  const factory = PROCESSORS[key]

  if (!factory) {
    throw new Error(
      `Unknown payment processor "${key}". Available: ${Object.keys(PROCESSORS).join(', ')}`
    )
  }

  _processor = factory()
  return _processor
}

/**
 * Process a payment using the configured processor.
 * Convenience wrapper around getPaymentProcessor().charge().
 */
export async function processPayment(
  request: PaymentRequest
): Promise<PaymentResult> {
  const processor = getPaymentProcessor()
  return processor.charge(request)
}

/**
 * Refund a payment using the configured processor.
 */
export async function refundPayment(
  transactionId: string,
  amount?: number
): Promise<PaymentResult> {
  const processor = getPaymentProcessor()
  return processor.refund(transactionId, amount)
}
