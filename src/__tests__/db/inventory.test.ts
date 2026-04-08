/**
 * Inventory System Tests
 *
 * Tests the atomic stock decrement pattern, stock reservations,
 * and reservation cleanup — the core of the inventory system.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { prisma } from '@/lib/db'
import {
  decrementStock,
  reserveStock,
  getAvailableStock,
  releaseExpiredReservations,
  releaseSessionReservations,
  fulfillReservation,
} from '@/lib/inventory'

// Use a dedicated test variant to avoid polluting seed data
let testVariantId: string
let testProductId: string

beforeAll(async () => {
  // Get a category to use
  const category = await prisma.category.findFirst()

  // Create a test product + variant
  const product = await prisma.product.create({
    data: {
      name: 'Test Product (Inventory)',
      slug: `test-inventory-${Date.now()}`,
      description: 'Test product for inventory tests',
      categoryId: category!.id,
      status: 'ACTIVE',
      variants: {
        create: {
          name: '5mg',
          sku: `TEST-INV-${Date.now()}`,
          price: 10.0,
          stock: 50,
        },
      },
    },
    include: { variants: true },
  })
  testProductId = product.id
  testVariantId = product.variants[0].id
})

afterEach(async () => {
  // Clean up reservations after each test
  await prisma.stockReservation.deleteMany({
    where: { variantId: testVariantId },
  })
})

afterAll(async () => {
  // Clean up test data
  await prisma.product.delete({ where: { id: testProductId } })
})

describe('Atomic Stock Decrement', () => {
  it('decrements stock successfully when sufficient', async () => {
    const before = await prisma.variant.findUnique({ where: { id: testVariantId } })
    const success = await decrementStock(testVariantId, 5)
    const after = await prisma.variant.findUnique({ where: { id: testVariantId } })

    expect(success).toBe(true)
    expect(after!.stock).toBe(before!.stock - 5)
  })

  it('fails when insufficient stock', async () => {
    const before = await prisma.variant.findUnique({ where: { id: testVariantId } })
    const success = await decrementStock(testVariantId, before!.stock + 100)

    expect(success).toBe(false)

    // Stock should be unchanged
    const after = await prisma.variant.findUnique({ where: { id: testVariantId } })
    expect(after!.stock).toBe(before!.stock)
  })

  it('fails when decrementing to exactly below zero', async () => {
    const current = await prisma.variant.findUnique({ where: { id: testVariantId } })
    const success = await decrementStock(testVariantId, current!.stock + 1)
    expect(success).toBe(false)
  })

  it('succeeds when decrementing exact remaining stock', async () => {
    // Reset stock to a known value
    await prisma.variant.update({
      where: { id: testVariantId },
      data: { stock: 3 },
    })

    const success = await decrementStock(testVariantId, 3)
    expect(success).toBe(true)

    const after = await prisma.variant.findUnique({ where: { id: testVariantId } })
    expect(after!.stock).toBe(0)

    // Restore stock
    await prisma.variant.update({
      where: { id: testVariantId },
      data: { stock: 50 },
    })
  })
})

describe('Stock Reservations', () => {
  it('creates a reservation and reduces available stock', async () => {
    const availableBefore = await getAvailableStock(testVariantId)

    const reservationId = await reserveStock(testVariantId, 5, 'session-test-1')
    expect(reservationId).not.toBeNull()

    const availableAfter = await getAvailableStock(testVariantId)
    expect(availableAfter).toBe(availableBefore - 5)
  })

  it('prevents reservation when exceeding available stock', async () => {
    // Reserve most of the stock
    const variant = await prisma.variant.findUnique({ where: { id: testVariantId } })
    await reserveStock(testVariantId, variant!.stock - 2, 'session-block')

    // Try to reserve more than remaining
    const result = await reserveStock(testVariantId, 5, 'session-overflow')
    expect(result).toBeNull()
  })

  it('available stock = real stock minus active reservations', async () => {
    const variant = await prisma.variant.findUnique({ where: { id: testVariantId } })

    await reserveStock(testVariantId, 10, 'session-avail-1')
    await reserveStock(testVariantId, 7, 'session-avail-2')

    const available = await getAvailableStock(testVariantId)
    expect(available).toBe(variant!.stock - 17)
  })

  it('returns 0 for non-existent variant', async () => {
    const available = await getAvailableStock('non-existent-id')
    expect(available).toBe(0)
  })
})

describe('Reservation Cleanup', () => {
  it('releases expired reservations', async () => {
    // Create an already-expired reservation directly
    await prisma.stockReservation.create({
      data: {
        variantId: testVariantId,
        quantity: 5,
        sessionId: 'expired-session',
        expiresAt: new Date(Date.now() - 60000), // 1 minute ago
      },
    })

    const released = await releaseExpiredReservations()
    expect(released).toBeGreaterThanOrEqual(1)

    // Verify it's gone
    const remaining = await prisma.stockReservation.findMany({
      where: { sessionId: 'expired-session' },
    })
    expect(remaining).toHaveLength(0)
  })

  it('does not release active (non-expired) reservations', async () => {
    await reserveStock(testVariantId, 3, 'active-session')

    const released = await releaseExpiredReservations()

    const remaining = await prisma.stockReservation.findMany({
      where: { sessionId: 'active-session' },
    })
    expect(remaining).toHaveLength(1)
  })

  it('releases all reservations for a specific session', async () => {
    await reserveStock(testVariantId, 2, 'session-to-clear')
    await reserveStock(testVariantId, 3, 'session-to-clear')
    await reserveStock(testVariantId, 1, 'session-to-keep')

    await releaseSessionReservations('session-to-clear')

    const cleared = await prisma.stockReservation.findMany({
      where: { sessionId: 'session-to-clear' },
    })
    const kept = await prisma.stockReservation.findMany({
      where: { sessionId: 'session-to-keep' },
    })

    expect(cleared).toHaveLength(0)
    expect(kept).toHaveLength(1)
  })
})

describe('Reservation Fulfillment', () => {
  it('converts reservations to stock decrements on fulfillment', async () => {
    // Reset stock
    await prisma.variant.update({
      where: { id: testVariantId },
      data: { stock: 50 },
    })

    await reserveStock(testVariantId, 5, 'fulfill-session')

    const success = await fulfillReservation('fulfill-session')
    expect(success).toBe(true)

    // Stock should be decremented
    const variant = await prisma.variant.findUnique({ where: { id: testVariantId } })
    expect(variant!.stock).toBe(45)

    // Reservations should be cleaned up
    const reservations = await prisma.stockReservation.findMany({
      where: { sessionId: 'fulfill-session' },
    })
    expect(reservations).toHaveLength(0)
  })

  it('returns false for non-existent session', async () => {
    const success = await fulfillReservation('non-existent-session')
    expect(success).toBe(false)
  })
})
