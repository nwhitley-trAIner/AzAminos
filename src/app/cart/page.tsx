'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { CartItemRow } from '@/components/cart/cart-item'
import { CartSummary } from '@/components/cart/cart-summary'

export default function CartPage() {
  const { cart, clearCart, itemCount } = useCart()

  return (
    <div className="container-main py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-brand-navy-800 mb-8">Shopping Cart</h1>

      {itemCount === 0 ? (
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
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          <h2 className="text-xl font-medium text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">
            Browse our research peptides to get started.
          </p>
          <Link href="/products" className="btn-primary">
            Shop Products
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
              <button
                onClick={clearCart}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear Cart
              </button>
            </div>
            {cart.items.map((item) => (
              <CartItemRow key={item.variantId} item={item} />
            ))}

            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-brand-teal-600 hover:text-brand-teal-700 mt-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  )
}
