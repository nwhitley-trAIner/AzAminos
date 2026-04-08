'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/lib/cart-context'
import { formatPriceDollars } from '@/lib/utils'
import type { ProductWithVariants, BulkPriceTier } from '@/types'

interface AddToCartButtonProps {
  product: ProductWithVariants
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  if (!selectedVariant) return null

  const inStock = selectedVariant.stock > 0
  const bulkPricing = selectedVariant.bulkPricing as BulkPriceTier[] | null

  // Find applicable bulk price
  const effectivePrice =
    bulkPricing
      ?.filter((tier) => quantity >= tier.qty)
      .sort((a, b) => b.qty - a.qty)[0]?.price ?? selectedVariant.price

  function handleAddToCart() {
    addItem(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        variantName: selectedVariant.name,
        sku: selectedVariant.sku,
        price: effectivePrice,
        imageUrl: product.imageUrl,
        stock: selectedVariant.stock,
      },
      quantity
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Variant Selector */}
      {product.variants.length > 1 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Size</label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => {
                  setSelectedVariant(variant)
                  setQuantity(1)
                }}
                disabled={variant.stock <= 0}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selectedVariant.id === variant.id
                    ? 'border-brand-teal-500 bg-brand-teal-50 text-brand-teal-700'
                    : variant.stock > 0
                      ? 'border-gray-200 hover:border-brand-teal-300'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {variant.name} — {formatPriceDollars(variant.price)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-brand-navy-800">
          {formatPriceDollars(effectivePrice)}
        </span>
        {selectedVariant.compareAtPrice && (
          <span className="text-lg text-gray-400 line-through">
            {formatPriceDollars(selectedVariant.compareAtPrice)}
          </span>
        )}
        {effectivePrice < selectedVariant.price && (
          <span className="badge-success">Bulk Discount</span>
        )}
      </div>

      {/* Bulk Pricing */}
      {bulkPricing && bulkPricing.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Volume Discounts:</p>
          <div className="flex flex-wrap gap-3">
            {bulkPricing.map((tier) => (
              <span
                key={tier.qty}
                className={`text-sm ${
                  quantity >= tier.qty ? 'text-brand-teal-700 font-semibold' : 'text-gray-500'
                }`}
              >
                {tier.qty}+ @ {formatPriceDollars(tier.price)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stock indicator */}
      {inStock ? (
        <p className="text-sm text-emerald-600">
          {selectedVariant.stock <= 10
            ? `Only ${selectedVariant.stock} left in stock`
            : 'In Stock — Ships Same Day'}
        </p>
      ) : (
        <p className="text-sm text-red-500 font-medium">Out of Stock</p>
      )}

      {/* Quantity + Add to Cart */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            -
          </button>
          <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
            disabled={quantity >= selectedVariant.stock}
            className="px-3 py-2 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            +
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className="btn-primary flex-1 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added to Cart
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
              >
                Add to Cart — {formatPriceDollars(effectivePrice * quantity)}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  )
}
