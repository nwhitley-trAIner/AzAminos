/**
 * Payment Abstraction Layer Tests
 *
 * Tests the MockProcessor, processor factory, and verifies all
 * adapter stubs instantiate correctly.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MockProcessor } from '@/lib/payment/mock'
import { AuthorizeNetProcessor } from '@/lib/payment/authorize-net'
import { NMIProcessor } from '@/lib/payment/nmi'
import { CoinbaseProcessor } from '@/lib/payment/coinbase'
import type { PaymentRequest } from '@/types'

const baseRequest: PaymentRequest = {
  amount: 149.99,
  currency: 'USD',
  orderId: 'AZ-TEST-001',
  customerEmail: 'test@example.com',
  card: {
    number: '4111111111111111',
    exp: '12/28',
    cvv: '123',
  },
}

describe('MockProcessor', () => {
  let processor: MockProcessor

  beforeEach(() => {
    processor = new MockProcessor()
  })

  it('has the correct name', () => {
    expect(processor.name).toBe('Mock Processor')
  })

  it('successfully charges a valid card', async () => {
    const result = await processor.charge(baseRequest)

    expect(result.success).toBe(true)
    expect(result.transactionId).toBeTruthy()
    expect(result.transactionId).toMatch(/^mock_/)
    expect(result.processorResponse).toBeTruthy()
    expect((result.processorResponse as any).amount).toBe(149.99)
    expect((result.processorResponse as any).processor).toBe('mock')
  })

  it('declines cards ending in 0000', async () => {
    const result = await processor.charge({
      ...baseRequest,
      card: { number: '4111111111110000', exp: '12/28', cvv: '123' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('declined')
    expect(result.transactionId).toBeUndefined()
  })

  it('rejects amounts over $10,000', async () => {
    const result = await processor.charge({
      ...baseRequest,
      amount: 15000,
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('exceeds limit')
  })

  it('successfully refunds a transaction', async () => {
    const charge = await processor.charge(baseRequest)
    const refund = await processor.refund(charge.transactionId!, 149.99)

    expect(refund.success).toBe(true)
    expect(refund.transactionId).toMatch(/^mock_refund_/)
    expect((refund.processorResponse as any).originalTransaction).toBe(
      charge.transactionId
    )
  })

  it('refund works without specifying amount (full refund)', async () => {
    const charge = await processor.charge(baseRequest)
    const refund = await processor.refund(charge.transactionId!)

    expect(refund.success).toBe(true)
  })

  it('generates unique transaction IDs', async () => {
    const result1 = await processor.charge(baseRequest)
    const result2 = await processor.charge(baseRequest)

    expect(result1.transactionId).not.toBe(result2.transactionId)
  })
})

describe('Processor Adapters Instantiation', () => {
  it('AuthorizeNetProcessor instantiates without credentials (warns)', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const processor = new AuthorizeNetProcessor()

    expect(processor.name).toBe('Authorize.net')
    consoleSpy.mockRestore()
  })

  it('AuthorizeNet rejects charge without credentials', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const processor = new AuthorizeNetProcessor()
    const result = await processor.charge(baseRequest)

    expect(result.success).toBe(false)
    expect(result.error).toContain('not configured')
    consoleSpy.mockRestore()
  })

  it('NMIProcessor instantiates without credentials (warns)', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const processor = new NMIProcessor()

    expect(processor.name).toBe('NMI')
    consoleSpy.mockRestore()
  })

  it('NMI rejects charge without credentials', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const processor = new NMIProcessor()
    const result = await processor.charge(baseRequest)

    expect(result.success).toBe(false)
    expect(result.error).toContain('not configured')
    consoleSpy.mockRestore()
  })

  it('CoinbaseProcessor instantiates without credentials (warns)', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const processor = new CoinbaseProcessor()

    expect(processor.name).toBe('Coinbase Commerce')
    consoleSpy.mockRestore()
  })

  it('Coinbase rejects charge without credentials', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const processor = new CoinbaseProcessor()
    const result = await processor.charge(baseRequest)

    expect(result.success).toBe(false)
    expect(result.error).toContain('not configured')
    consoleSpy.mockRestore()
  })

  it('Coinbase refund returns manual-refund message', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const processor = new CoinbaseProcessor()
    const result = await processor.refund('some-charge-id')

    expect(result.success).toBe(false)
    expect(result.error).toContain('manually')
    consoleSpy.mockRestore()
  })
})

describe('Payment Processor Factory', () => {
  it('default processor is mock', async () => {
    // The factory reads PAYMENT_PROCESSOR env var, which is "mock" in .env
    const { getPaymentProcessor } = await import('@/lib/payment/index')

    // Reset the cached processor by reimporting
    vi.resetModules()
    const freshModule = await import('@/lib/payment/index')
    const processor = freshModule.getPaymentProcessor()

    expect(processor.name).toBe('Mock Processor')
  })
})
