import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

const variantUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  compareAtPrice: z.number().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  weight: z.number().nullable().optional(),
  bulkPricing: z
    .array(
      z.object({
        qty: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .nullable()
    .optional(),
})

interface RouteParams {
  params: { id: string }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const data = variantUpdateSchema.parse(body)

    if (data.bulkPricing) {
      const sorted = [...data.bulkPricing].sort((a, b) => a.qty - b.qty)
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].qty <= sorted[i - 1].qty) {
          return NextResponse.json(
            { error: 'Bulk pricing tiers must have unique, ascending quantities' },
            { status: 400 }
          )
        }
      }
    }

    const { bulkPricing, ...rest } = data
    const variant = await prisma.variant.update({
      where: { id: params.id },
      data: {
        ...rest,
        ...(bulkPricing === undefined
          ? {}
          : bulkPricing === null
            ? { bulkPricing: Prisma.JsonNull }
            : { bulkPricing }),
      },
    })

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: 'UPDATE_VARIANT',
        entity: 'Variant',
        entityId: variant.id,
        details: { changes: Object.keys(data) },
      },
    })

    return NextResponse.json(variant)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Update variant error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
