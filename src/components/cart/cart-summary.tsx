'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatPriceDollars } from '@/lib/utils'

const FREE_SHIPPING_THRESHOLD = 99

export function CartSummary() {
  const { subtotal, itemCount } = useCart()

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 9.99
  const total = subtotal + shipping
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({itemCount} items)</span>
          <span className="font-medium">{formatPriceDollars(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-emerald-600">FREE</span>
            ) : (
              formatPriceDollars(shipping)
            )}
          </span>
        </div>

        {remainingForFreeShipping > 0 && (
          <div className="bg-brand-teal-50 text-brand-teal-700 rounded-lg p-3 text-xs">
            Add {formatPriceDollars(remainingForFreeShipping)} more for free shipping!
          </div>
        )}

        <div className="border-t border-gray-200 pt-3 flex justify-between text-base">
          <span className="font-semibold text-brand-navy-800">Total</span>
          <span className="font-bold text-brand-navy-800">{formatPriceDollars(total)}</span>
        </div>
      </div>

      <Link href="/checkout" className="btn-primary w-full mt-6 text-center">
        Proceed to Checkout
      </Link>

      <p className="text-xs text-gray-400 text-center mt-3">
        Taxes calculated at checkout
      </p>
    </div>
  )
}
