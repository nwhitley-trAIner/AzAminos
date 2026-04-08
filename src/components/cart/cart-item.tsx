'use client'

import { useCart } from '@/lib/cart-context'
import { formatPriceDollars } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
}

export function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-brand-navy-800 truncate">{item.productName}</h3>
        <p className="text-sm text-gray-500">{item.variantName}</p>
        <p className="text-sm font-medium text-brand-navy-700 mt-1">
          {formatPriceDollars(item.price)}
        </p>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          -
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
          disabled={item.quantity >= item.stock}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          +
        </button>
      </div>

      {/* Line total */}
      <div className="text-right w-24">
        <p className="font-semibold text-brand-navy-800">
          {formatPriceDollars(item.price * item.quantity)}
        </p>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(item.variantId)}
        className="text-gray-400 hover:text-red-500 transition-colors p-1"
        aria-label="Remove item"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
