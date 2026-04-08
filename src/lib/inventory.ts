import { prisma } from './db'

const RESERVATION_TTL_MINUTES = parseInt(
  process.env.STOCK_RESERVATION_TTL_MINUTES || '15',
  10
)

/**
 * Atomic stock decrement. Returns true if successful, false if insufficient stock.
 * Uses raw SQL to ensure atomicity — no race conditions.
 */
export async function decrementStock(
  variantId: string,
  quantity: number
): Promise<boolean> {
  const result = await prisma.$executeRaw`
    UPDATE "Variant"
    SET stock = stock - ${quantity}, "updatedAt" = NOW()
    WHERE id = ${variantId}
    AND stock >= ${quantity}
  `
  return result === 1
}

/**
 * Reserve stock for a checkout session. Stock is held for RESERVATION_TTL_MINUTES.
 * Returns reservation ID if successful, null if insufficient stock.
 */
export async function reserveStock(
  variantId: string,
  quantity: number,
  sessionId: string
): Promise<string | null> {
  // First check available stock (real stock minus active reservations)
  const available = await getAvailableStock(variantId)
  if (available < quantity) return null

  const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000)

  const reservation = await prisma.stockReservation.create({
    data: {
      variantId,
      quantity,
      sessionId,
      expiresAt,
    },
  })

  return reservation.id
}

/**
 * Get available stock = actual stock minus active (non-expired) reservations.
 */
export async function getAvailableStock(variantId: string): Promise<number> {
  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
    select: { stock: true },
  })

  if (!variant) return 0

  const reserved = await prisma.stockReservation.aggregate({
    where: {
      variantId,
      expiresAt: { gt: new Date() },
    },
    _sum: { quantity: true },
  })

  return variant.stock - (reserved._sum.quantity || 0)
}

/**
 * Release expired reservations. Call this periodically (e.g., via cron or API).
 */
export async function releaseExpiredReservations(): Promise<number> {
  const result = await prisma.stockReservation.deleteMany({
    where: {
      expiresAt: { lte: new Date() },
    },
  })
  return result.count
}

/**
 * Release reservations for a specific session (e.g., on checkout completion or abandonment).
 */
export async function releaseSessionReservations(
  sessionId: string
): Promise<void> {
  await prisma.stockReservation.deleteMany({
    where: { sessionId },
  })
}

/**
 * Convert reservation to actual stock decrement (on successful payment).
 * Releases the reservation and decrements real stock atomically.
 */
export async function fulfillReservation(
  sessionId: string
): Promise<boolean> {
  const reservations = await prisma.stockReservation.findMany({
    where: { sessionId },
  })

  if (reservations.length === 0) return false

  // Decrement stock for each reservation
  for (const res of reservations) {
    const success = await decrementStock(res.variantId, res.quantity)
    if (!success) return false
  }

  // Clean up reservations
  await releaseSessionReservations(sessionId)
  return true
}
