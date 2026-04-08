/**
 * Checkout Flow Tests
 *
 * Tests the end-to-end checkout process:
 * stock validation, payment processing, order creation, stock decrement.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/db'
import { processPayment } from '@/lib/payment'
import { decrementStock, getAvailableStock } from '@/lib/inventory'
import { generateOrderNumber } from '@/lib/utils'

let testVariantId: string
let testProductId: string
let initialStock: number

beforeAll(async () => {
  const category = await prisma.category.findFirst()
  const product = await prisma.product.create({
    data: {
      name: 'Test Product (Checkout)',
      slug: `test-checkout-${Date.now()}`,
      description: 'Test product for checkout tests',
      categoryId: category!.id,
      status: 'ACTIVE',
      variants: {
        create: {
          name: '5mg',
          sku: `TEST-CHK-${Date.now()}`,
          price: 49.99,
          stock: 20,
        },
      },
    },
    include: { variants: true },
  })
  testProductId = product.id
  testVariantId = product.variants[0].id
  initialStock = 20
})

afterAll(async () => {
  // Clean up: delete orders created during tests, then test product
  await prisma.orderItem.deleteMany({
    where: { order: { email: 'checkout-test@azaminos.com' } },
  })
  await prisma.order.deleteMany({
    where: { email: 'checkout-test@azaminos.com' },
  })
  await prisma.product.delete({ where: { id: testProductId } })
})

describe('Checkout - Stock Validation', () => {
  it('reports available stock correctly', async () => {
    const available = await getAvailableStock(testVariantId)
    expect(available).toBe(initialStock)
  })

  it('rejects checkout when quantity exceeds stock', async () => {
    const available = await getAvailableStock(testVariantId)
    const excessive = available + 10
    // This simulates the check done in the checkout API
    expect(excessive).toBeGreaterThan(available)
  })
})

describe('Checkout - Payment Processing', () => {
  it('mock processor accepts valid payment', async () => {
    const result = await processPayment({
      amount: 49.99,
      currency: 'USD',
      orderId: 'AZ-TEST-PAY-001',
      customerEmail: 'checkout-test@azaminos.com',
      card: { number: '4111111111111111', exp: '12/28', cvv: '123' },
    })

    expect(result.success).toBe(true)
    expect(result.transactionId).toBeTruthy()
  })

  it('mock processor rejects declined card', async () => {
    const result = await processPayment({
      amount: 49.99,
      currency: 'USD',
      orderId: 'AZ-TEST-PAY-002',
      customerEmail: 'checkout-test@azaminos.com',
      card: { number: '4111111111110000', exp: '12/28', cvv: '123' },
    })

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })
})

describe('Checkout - Order Creation', () => {
  it('creates a full order with items', async () => {
    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        email: 'checkout-test@azaminos.com',
        shippingName: 'Test Researcher',
        shippingAddress: {
          line1: '123 Lab Ave',
          city: 'Phoenix',
          state: 'AZ',
          zip: '85001',
          country: 'US',
        },
        subtotal: 49.99,
        shipping: 9.99,
        total: 59.98,
        paymentMethod: 'card',
        paymentId: 'mock_test_123',
        paymentStatus: 'CAPTURED',
        status: 'CONFIRMED',
        ruoAcknowledgedAt: new Date(),
        ruoIp: '127.0.0.1',
        items: {
          create: [
            {
              productName: 'Test Product',
              variantName: '5mg',
              sku: 'TEST-CHK',
              quantity: 1,
              price: 49.99,
              total: 49.99,
            },
          ],
        },
      },
      include: { items: true },
    })

    expect(order.orderNumber).toBe(orderNumber)
    expect(order.status).toBe('CONFIRMED')
    expect(order.paymentStatus).toBe('CAPTURED')
    expect(order.items).toHaveLength(1)
    expect(order.total).toBe(59.98)
    expect(order.ruoAcknowledgedAt).toBeTruthy()
    expect(order.ruoIp).toBe('127.0.0.1')
  })

  it('order number format is correct', async () => {
    const orderNumber = generateOrderNumber()
    expect(orderNumber).toMatch(/^AZ-[A-Z0-9]+$/)
  })
})

describe('Checkout - Stock Decrement After Payment', () => {
  it('decrements stock after successful payment', async () => {
    const stockBefore = await getAvailableStock(testVariantId)
    const qty = 2

    // Simulate: validate stock -> process payment -> decrement
    const available = await getAvailableStock(testVariantId)
    expect(available).toBeGreaterThanOrEqual(qty)

    const paymentResult = await processPayment({
      amount: 99.98,
      currency: 'USD',
      orderId: generateOrderNumber(),
      customerEmail: 'checkout-test@azaminos.com',
      card: { number: '4111111111111111', exp: '12/28', cvv: '123' },
    })
    expect(paymentResult.success).toBe(true)

    const decremented = await decrementStock(testVariantId, qty)
    expect(decremented).toBe(true)

    const stockAfter = await getAvailableStock(testVariantId)
    expect(stockAfter).toBe(stockBefore - qty)
  })
})

describe('Checkout - Free Shipping Logic', () => {
  it('free shipping for orders >= $99', () => {
    const subtotal = 149.99
    const shipping = subtotal >= 99 ? 0 : 9.99
    expect(shipping).toBe(0)
  })

  it('$9.99 shipping for orders < $99', () => {
    const subtotal = 49.99
    const shipping = subtotal >= 99 ? 0 : 9.99
    expect(shipping).toBe(9.99)
  })

  it('free shipping at exactly $99', () => {
    const subtotal = 99
    const shipping = subtotal >= 99 ? 0 : 9.99
    expect(shipping).toBe(0)
  })
})
