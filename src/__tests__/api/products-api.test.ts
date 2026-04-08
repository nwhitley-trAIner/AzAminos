/**
 * Products API Tests
 *
 * Tests the public product listing and filtering API endpoints.
 * These run against the live Neon database with seed data.
 */
import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/db'

describe('Products Data Layer', () => {
  it('fetches all active products with variants', async () => {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
      },
    })

    expect(products.length).toBe(4)
    products.forEach((p) => {
      expect(p.category).toBeTruthy()
      expect(p.variants.length).toBeGreaterThan(0)
      expect(p.variants[0].price).toBeGreaterThan(0)
    })
  })

  it('filters products by category slug', async () => {
    const healing = await prisma.product.findMany({
      where: { status: 'ACTIVE', category: { slug: 'healing' } },
      include: { category: true },
    })

    expect(healing.length).toBe(2) // BPC-157 and TB-500
    healing.forEach((p) => {
      expect(p.category.slug).toBe('healing')
    })
  })

  it('filters products by growth-hormone category', async () => {
    const gh = await prisma.product.findMany({
      where: { status: 'ACTIVE', category: { slug: 'growth-hormone' } },
    })
    expect(gh.length).toBe(1)
    expect(gh[0].slug).toBe('cjc-1295-ipamorelin-blend')
  })

  it('filters products by nootropics category', async () => {
    const nootropics = await prisma.product.findMany({
      where: { status: 'ACTIVE', category: { slug: 'nootropics' } },
    })
    expect(nootropics.length).toBe(1)
    expect(nootropics[0].slug).toBe('selank')
  })

  it('search by name (case-insensitive)', async () => {
    const results = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        name: { contains: 'bpc', mode: 'insensitive' },
      },
    })
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('bpc-157')
  })

  it('search by description content', async () => {
    const results = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        description: { contains: 'thymosin', mode: 'insensitive' },
      },
    })
    expect(results.length).toBe(1)
    expect(results[0].slug).toBe('tb-500')
  })

  it('finds product by slug with full details', async () => {
    const product = await prisma.product.findUnique({
      where: { slug: 'bpc-157' },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
      },
    })

    expect(product).not.toBeNull()
    expect(product!.name).toBe('BPC-157')
    expect(product!.variants[0].price).toBeLessThan(product!.variants[1].price)
    expect(product!.category.name).toBe('Healing & Recovery')
  })

  it('returns null for non-existent slug', async () => {
    const product = await prisma.product.findUnique({
      where: { slug: 'does-not-exist' },
    })
    expect(product).toBeNull()
  })

  it('no product returns empty variant list', async () => {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE', category: { slug: 'non-existent-category' } },
      include: { variants: true },
    })
    expect(products).toHaveLength(0)
  })
})
