import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  casNumber: z.string().optional(),
  molecularWeight: z.string().optional(),
  molecularFormula: z.string().optional(),
  sequence: z.string().optional(),
  purity: z.number().optional(),
  form: z.string().optional(),
  storageInstructions: z.string().optional(),
  shelfLife: z.string().optional(),
  imageUrl: z.string().optional(),
  coaUrl: z.string().optional(),
  coaLabName: z.string().optional(),
  coaBatchNumber: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED']).optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

interface RouteParams {
  params: { id: string }
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin()

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json(product)
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
    const data = updateSchema.parse(body)

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
      },
    })

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: 'UPDATE_PRODUCT',
        entity: 'Product',
        entityId: product.id,
        details: { changes: Object.keys(data) },
      },
    })

    return NextResponse.json(product)
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

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const session = await requireAdmin()

    await prisma.product.delete({ where: { id: params.id } })

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: 'DELETE_PRODUCT',
        entity: 'Product',
        entityId: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
