import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { slugify } from '@/lib/utils'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  casNumber: z.string().optional(),
  molecularWeight: z.string().optional(),
  molecularFormula: z.string().optional(),
  sequence: z.string().optional(),
  purity: z.number().optional(),
  form: z.string().default('Lyophilized Powder'),
  storageInstructions: z.string().optional(),
  shelfLife: z.string().optional(),
  imageUrl: z.string().optional(),
  coaUrl: z.string().optional(),
  coaLabName: z.string().optional(),
  coaBatchNumber: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED']).default('DRAFT'),
  categoryId: z.string(),
  tags: z.array(z.string()).default([]),
  variants: z
    .array(
      z.object({
        name: z.string(),
        sku: z.string(),
        price: z.number().positive(),
        compareAtPrice: z.number().optional(),
        stock: z.number().int().min(0).default(0),
        weight: z.number().optional(),
        bulkPricing: z.array(z.object({ qty: z.number(), price: z.number() })).optional(),
      })
    )
    .min(1),
})

export async function GET() {
  try {
    await requireAdmin()

    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const data = productSchema.parse(body)

    const slug = slugify(data.name)

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        casNumber: data.casNumber,
        molecularWeight: data.molecularWeight,
        molecularFormula: data.molecularFormula,
        sequence: data.sequence,
        purity: data.purity,
        form: data.form,
        storageInstructions: data.storageInstructions,
        shelfLife: data.shelfLife,
        imageUrl: data.imageUrl,
        coaUrl: data.coaUrl,
        coaLabName: data.coaLabName,
        coaBatchNumber: data.coaBatchNumber,
        status: data.status,
        categoryId: data.categoryId,
        tags: data.tags,
        variants: {
          create: data.variants,
        },
      },
      include: {
        category: true,
        variants: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        adminId: session.adminId,
        action: 'CREATE_PRODUCT',
        entity: 'Product',
        entityId: product.id,
        details: { name: product.name },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
