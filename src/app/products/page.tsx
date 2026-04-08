import { prisma } from '@/lib/db'
import { ProductGrid } from '@/components/products/product-grid'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Products | AZ Aminos — Research Peptides',
  description:
    'Browse our full catalog of premium research peptides. Third-party tested, batch-specific COAs, USA made.',
}

interface ProductsPageProps {
  searchParams: { category?: string; search?: string }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, search } = searchParams

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      ...(category ? { category: { slug: category } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { tags: { hasSome: [search.toLowerCase()] } },
            ],
          }
        : {}),
    },
    include: {
      category: true,
      variants: {
        orderBy: { price: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  const activeCategory = categories.find((c) => c.slug === category)

  return (
    <div className="container-main py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-brand-navy-800">
          {activeCategory ? activeCategory.name : 'All Products'}
        </h1>
        <p className="text-gray-500 mt-2">
          {activeCategory?.description ||
            'Premium research peptides with batch-specific Certificates of Analysis.'}
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/products"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !category
              ? 'bg-brand-navy-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </a>
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat.slug
                ? 'bg-brand-navy-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Search */}
      <form className="mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search peptides..."
            className="input-field pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </div>
      </form>

      {/* Product Grid */}
      <ProductGrid products={products} />

      {/* Results count */}
      <p className="text-sm text-gray-400 mt-8">
        Showing {products.length} product{products.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
