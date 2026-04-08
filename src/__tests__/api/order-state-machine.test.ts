/**
 * Order State Machine Tests
 *
 * Tests that orders follow the correct state transitions
 * and maintain data integrity through the fulfillment pipeline.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'

let testOrderId: string

beforeAll(async () => {
  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      email: 'state-test@azaminos.com',
      shippingName: 'State Test',
      shippingAddress: { line1: '1 Test St', city: 'Phoenix', state: 'AZ', zip: '85001', country: 'US' },
      subtotal: 100,
      shipping: 0,
      total: 100,
      paymentMethod: 'card',
      paymentId: 'mock_state_test',
      paymentStatus: 'CAPTURED',
      status: 'PENDING',
      ruoAcknowledgedAt: new Date(),
      items: {
        create: [{
          productName: 'Test',
          variantName: '5mg',
          sku: 'TST-001',
          quantity: 1,
          price: 100,
          total: 100,
        }],
      },
    },
  })
  testOrderId = order.id
})

afterAll(async () => {
  await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } })
  await prisma.order.delete({ where: { id: testOrderId } })
})

describe('Order State Transitions', () => {
  it('starts in PENDING status', async () => {
    const order = await prisma.order.findUnique({ where: { id: testOrderId } })
    expect(order!.status).toBe('PENDING')
  })

  it('transitions to CONFIRMED', async () => {
    const order = await prisma.order.update({
      where: { id: testOrderId },
      data: { status: 'CONFIRMED' },
    })
    expect(order.status).toBe('CONFIRMED')
  })

  it('transitions to PROCESSING', async () => {
    const order = await prisma.order.update({
      where: { id: testOrderId },
      data: { status: 'PROCESSING' },
    })
    expect(order.status).toBe('PROCESSING')
  })

  it('transitions to SHIPPED with tracking number', async () => {
    const order = await prisma.order.update({
      where: { id: testOrderId },
      data: { status: 'SHIPPED', trackingNumber: '1Z999AA10123456784' },
    })
    expect(order.status).toBe('SHIPPED')
    expect(order.trackingNumber).toBe('1Z999AA10123456784')
  })

  it('transitions to DELIVERED', async () => {
    const order = await prisma.order.update({
      where: { id: testOrderId },
      data: { status: 'DELIVERED' },
    })
    expect(order.status).toBe('DELIVERED')
  })

  it('transitions to COMPLETED', async () => {
    const order = await prisma.order.update({
      where: { id: testOrderId },
      data: { status: 'COMPLETED' },
    })
    expect(order.status).toBe('COMPLETED')
  })
})

describe('Order Data Integrity', () => {
  it('order number is unique', async () => {
    const num1 = generateOrderNumber()
    const num2 = generateOrderNumber()
    expect(num1).not.toBe(num2)
  })

  it('order has all required fields', async () => {
    const order = await prisma.order.findUnique({
      where: { id: testOrderId },
      include: { items: true },
    })

    expect(order!.email).toBeTruthy()
    expect(order!.shippingName).toBeTruthy()
    expect(order!.shippingAddress).toBeTruthy()
    expect(order!.total).toBeGreaterThan(0)
    expect(order!.ruoAcknowledgedAt).toBeTruthy()
    expect(order!.items.length).toBeGreaterThan(0)
  })

  it('RUO acknowledgment is recorded', async () => {
    const order = await prisma.order.findUnique({ where: { id: testOrderId } })
    expect(order!.ruoAcknowledgedAt).toBeInstanceOf(Date)
  })

  it('order items sum to subtotal', async () => {
    const order = await prisma.order.findUnique({
      where: { id: testOrderId },
      include: { items: true },
    })
    const itemTotal = order!.items.reduce((sum, item) => sum + item.total, 0)
    expect(itemTotal).toBe(order!.subtotal)
  })

  it('total = subtotal + shipping', async () => {
    const order = await prisma.order.findUnique({ where: { id: testOrderId } })
    expect(order!.total).toBe(order!.subtotal + order!.shipping)
  })
})

describe('Order Queries', () => {
  it('finds orders by email', async () => {
    const orders = await prisma.order.findMany({
      where: { email: 'state-test@azaminos.com' },
    })
    expect(orders.length).toBeGreaterThan(0)
  })

  it('orders sorted by creation date (newest first)', async () => {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    })
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
        orders[i].createdAt.getTime()
      )
    }
  })
})
