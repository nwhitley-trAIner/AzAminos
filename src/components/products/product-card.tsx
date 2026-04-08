'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatPriceDollars } from '@/lib/utils'

interface ProductCardProps {
  product: {
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
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryVariant = product.variants[0]
  if (!primaryVariant) return null

  const inStock = product.variants.some((v) => v.stock > 0)
  const lowestPrice = Math.min(...product.variants.map((v) => v.price))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="card overflow-hidden">
          {/* Image */}
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.purity && (
                <span className="badge-success text-xs">
                  {product.purity}% Purity
                </span>
              )}
              {!inStock && (
                <span className="badge-danger text-xs">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-brand-teal-600 font-medium uppercase tracking-wide mb-1">
              {product.category.name}
            </p>
            <h3 className="font-semibold text-brand-navy-800 group-hover:text-brand-teal-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
            {product.shortDescription && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {product.shortDescription}
              </p>
            )}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-lg font-bold text-brand-navy-800">
                {product.variants.length > 1 ? 'From ' : ''}
                {formatPriceDollars(lowestPrice)}
              </span>
              {primaryVariant.compareAtPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPriceDollars(primaryVariant.compareAtPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{product.form}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
