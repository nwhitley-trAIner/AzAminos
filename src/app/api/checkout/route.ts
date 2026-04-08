import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { processPayment } from '@/lib/payment'
import { decrementStock, getAvailableStock } from '@/lib/inventory'
import { generateOrderNumber } from '@/lib/utils'
import { z } from 'zod'

const checkoutSchema = z.object({
  email: z.string().email(),
  shippingName: z.string().min(1),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zip: z.string().min(1),
    country: z.string().min(1),
  }),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        productName: z.string(),
        variantName: z.string(),
        sku: z.string(),
        price: z.number().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  card: z.object({
    number: z.string().min(1),
    exp: z.string().min(1),
    cvv: z.string().min(1),
  }),
  ruoAcknowledged: z.literal(true),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = checkoutSchema.parse(body)

    // 1. Validate stock availability for all items
    for (const item of data.items) {
      const available = await getAvailableStock(item.variantId)
      if (available < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${item.productName} (${item.variantName}). Only ${available} available.`,
          },
          { status: 400 }
        )
      }
    }

    // 2. Calculate totals
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const shipping = subtotal >= 99 ? 0 : 9.99
    const total = subtotal + shipping

    // 3. Process payment
    const orderNumber = generateOrderNumber()
    const paymentResult = await processPayment({
      amount: total,
      currency: 'USD',
      orderId: orderNumber,
      customerEmail: data.email,
      card: data.card,
      billingAddress: data.shippingAddress,
    })

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Payment failed' },
        { status: 400 }
      )
    }

    // 4. Decrement stock atomically
    for (const item of data.items) {
      const decremented = await decrementStock(item.variantId, item.quantity)
      if (!decremented) {
        // Stock changed between validation and decrement — rare but possible
        return NextResponse.json(
          {
            error: `Stock for ${item.productName} changed during checkout. Please try again.`,
          },
          { status: 409 }
        )
      }
    }

    // 5. Create order
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const order = await prisma.order.create({
      data: {
        orderNumber,
        email: data.email,
        shippingName: data.shippingName,
        shippingAddress: data.shippingAddress,
        subtotal,
        shipping,
        total,
        paymentMethod: 'card',
        paymentId: paymentResult.transactionId,
        paymentStatus: 'CAPTURED',
        status: 'CONFIRMED',
        ruoAcknowledgedAt: new Date(),
        ruoIp: clientIp,
        items: {
          create: data.items.map((item) => ({
            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          })),
        },
      },
      include: { items: true },
    })

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      total: order.total,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid checkout data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
