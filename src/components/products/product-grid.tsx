import { ProductCard } from './product-card'

interface ProductGridProps {
  products: {
    name: string
    slug: string
    shortDescription: string | null
    purity: number | null
    form: string
    imageUrl: string | null
    category: { name: string }
    variants: {
      id: string
      name: string
      price: number
      compareAtPrice: number | null
      stock: number
    }[]
  }[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="w-16 h-16 text-gray-300 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-600 mb-1">No products found</h3>
        <p className="text-gray-400">Check back soon for new arrivals.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  )
}
