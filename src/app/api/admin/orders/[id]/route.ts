import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

interface RouteParams {
  params: { id: string }
}

const updateOrderSchema = z.object({
  status: z
    .enum([
      'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
      'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED',
    ])
    .optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin()

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const data = updateOrderSchema.parse(body)

    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      include: { items: true },
    })

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: 'UPDATE_ORDER',
        entity: 'Order',
        entityId: order.id,
        details: { changes: data },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
