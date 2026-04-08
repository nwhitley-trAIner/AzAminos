/**
 * Database & Seed Integrity Tests
 *
 * Verifies that the Neon PostgreSQL database is connected,
 * seed data is correctly populated, and data relationships are intact.
 */
import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/db'

describe('Database Connection', () => {
  it('connects to Neon PostgreSQL successfully', async () => {
    const result = await prisma.$queryRaw<[{ now: Date }]>`SELECT NOW()`
    expect(result[0].now).toBeInstanceOf(Date)
  })
})

describe('Seed Data Integrity', () => {
  describe('Categories', () => {
    it('has exactly 3 categories', async () => {
      const categories = await prisma.category.findMany()
      expect(categories).toHaveLength(3)
    })

    it('has correct category slugs', async () => {
      const slugs = (await prisma.category.findMany({ select: { slug: true } }))
        .map((c) => c.slug)
        .sort()
      expect(slugs).toEqual(['growth-hormone', 'healing', 'nootropics'])
    })

    it('categories have sortOrder defined', async () => {
      const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
      expect(categories[0].name).toBe('Healing & Recovery')
      expect(categories[1].name).toBe('Growth Hormone Secretagogues')
      expect(categories[2].name).toBe('Nootropics')
    })
  })

  describe('Products', () => {
    it('has exactly 4 products', async () => {
      const count = await prisma.product.count()
      expect(count).toBe(4)
    })

    it('all products are ACTIVE status', async () => {
      const products = await prisma.product.findMany({ select: { status: true } })
      expect(products.every((p) => p.status === 'ACTIVE')).toBe(true)
    })

    it('BPC-157 exists with correct data', async () => {
      const bpc = await prisma.product.findUnique({
        where: { slug: 'bpc-157' },
        include: { variants: true, category: true },
      })
      expect(bpc).not.toBeNull()
      expect(bpc!.name).toBe('BPC-157')
      expect(bpc!.casNumber).toBe('137525-51-0')
      expect(bpc!.purity).toBe(99.1)
      expect(bpc!.category.slug).toBe('healing')
      expect(bpc!.variants).toHaveLength(2)
      expect(bpc!.coaLabName).toBe('Janoshik Analytical')
    })

    it('TB-500 exists with correct data', async () => {
      const tb = await prisma.product.findUnique({
        where: { slug: 'tb-500' },
        include: { variants: true },
      })
      expect(tb).not.toBeNull()
      expect(tb!.casNumber).toBe('77591-33-4')
      expect(tb!.variants).toHaveLength(2)
    })

    it('CJC/Ipamorelin blend exists', async () => {
      const blend = await prisma.product.findUnique({
        where: { slug: 'cjc-1295-ipamorelin-blend' },
        include: { variants: true, category: true },
      })
      expect(blend).not.toBeNull()
      expect(blend!.category.slug).toBe('growth-hormone')
      expect(blend!.variants).toHaveLength(1)
    })

    it('Selank exists with correct category', async () => {
      const selank = await prisma.product.findUnique({
        where: { slug: 'selank' },
        include: { category: true },
      })
      expect(selank).not.toBeNull()
      expect(selank!.category.slug).toBe('nootropics')
      expect(selank!.purity).toBe(99.2)
    })

    it('all products have RUO disclaimer', async () => {
      const products = await prisma.product.findMany({
        select: { ruoDisclaimer: true },
      })
      products.forEach((p) => {
        expect(p.ruoDisclaimer).toBeTruthy()
        expect(p.ruoDisclaimer.toLowerCase()).toContain('research')
      })
    })

    it('all seed products have tags', async () => {
      const products = await prisma.product.findMany({
        where: { slug: { in: ['bpc-157', 'tb-500', 'cjc-1295-ipamorelin-blend', 'selank'] } },
        select: { name: true, tags: true },
      })
      products.forEach((p) => {
        expect(p.tags.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Variants', () => {
    it('seed products have 6 variants total', async () => {
      const count = await prisma.variant.count({
        where: { sku: { startsWith: 'AZ-' } },
      })
      expect(count).toBe(6)
    })

    it('all seed SKUs are unique', async () => {
      const skus = await prisma.variant.findMany({
        where: { sku: { startsWith: 'AZ-' } },
        select: { sku: true },
      })
      const uniqueSkus = new Set(skus.map((v) => v.sku))
      expect(uniqueSkus.size).toBe(skus.length)
    })

    it('all seed SKUs follow AZ- prefix convention', async () => {
      const variants = await prisma.variant.findMany({
        where: { sku: { startsWith: 'AZ-' } },
        select: { sku: true },
      })
      variants.forEach((v) => {
        expect(v.sku).toMatch(/^AZ-/)
      })
    })

    it('all prices are positive', async () => {
      const variants = await prisma.variant.findMany({ select: { price: true } })
      variants.forEach((v) => {
        expect(v.price).toBeGreaterThan(0)
      })
    })

    it('all stock quantities are non-negative', async () => {
      const variants = await prisma.variant.findMany({ select: { stock: true } })
      variants.forEach((v) => {
        expect(v.stock).toBeGreaterThanOrEqual(0)
      })
    })

    it('BPC-157 has bulk pricing configured', async () => {
      const variant = await prisma.variant.findUnique({
        where: { sku: 'AZ-BPC157-5MG' },
      })
      expect(variant).not.toBeNull()
      const bulkPricing = variant!.bulkPricing as any[]
      expect(bulkPricing).toBeTruthy()
      expect(bulkPricing.length).toBeGreaterThan(0)
      // Bulk prices should be lower than base price
      bulkPricing.forEach((tier: any) => {
        expect(tier.price).toBeLessThan(variant!.price)
        expect(tier.qty).toBeGreaterThan(1)
      })
    })
  })

  describe('Admin User', () => {
    it('default admin user exists', async () => {
      const admin = await prisma.adminUser.findUnique({
        where: { email: 'admin@azaminos.com' },
      })
      expect(admin).not.toBeNull()
      expect(admin!.role).toBe('OWNER')
      expect(admin!.name).toBe('Admin')
    })

    it('admin password is hashed (not plaintext)', async () => {
      const admin = await prisma.adminUser.findUnique({
        where: { email: 'admin@azaminos.com' },
      })
      expect(admin!.password).not.toBe('admin123!')
      expect(admin!.password).toMatch(/^\$2[aby]?\$/) // bcrypt hash prefix
    })
  })
})
