'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { formatPriceDollars } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, subtotal, clearCart, itemCount } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shipping = subtotal >= 99 ? 0 : 9.99
  const total = subtotal + shipping

  const [form, setForm] = useState({
    email: '',
    shippingName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    cardNumber: '',
    cardExp: '',
    cardCvv: '',
    ruoAcknowledged: false,
  })

  function updateForm(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.ruoAcknowledged) {
      setError('You must acknowledge the Research Use Only disclaimer to proceed.')
      return
    }
    if (itemCount === 0) {
      setError('Your cart is empty.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          shippingName: form.shippingName,
          shippingAddress: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            zip: form.zip,
            country: form.country,
          },
          items: cart.items,
          card: {
            number: form.cardNumber.replace(/\s/g, ''),
            exp: form.cardExp,
            cvv: form.cardCvv,
          },
          ruoAcknowledged: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Checkout failed. Please try again.')
        return
      }

      clearCart()
      router.push(`/checkout/success?order=${data.orderNumber}`)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (itemCount === 0) {
    return (
      <div className="container-main py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-navy-800 mb-4">Your cart is empty</h1>
        <a href="/products" className="btn-primary">Shop Products</a>
      </div>
    )
  }

  return (
    <div className="container-main py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-brand-navy-800 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Fields */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <section>
              <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">
                Contact Information
              </h2>
              <input
                type="email"
                required
                placeholder="Email address"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="input-field"
              />
            </section>

            {/* Shipping */}
            <section>
              <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">
                Shipping Address
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={form.shippingName}
                  onChange={(e) => updateForm('shippingName', e.target.value)}
                  className="input-field"
                />
                <input
                  type="text"
                  required
                  placeholder="Address line 1"
                  value={form.line1}
                  onChange={(e) => updateForm('line1', e.target.value)}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Address line 2 (optional)"
                  value={form.line2}
                  onChange={(e) => updateForm('line2', e.target.value)}
                  className="input-field"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => updateForm('city', e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => updateForm('state', e.target.value)}
                    className="input-field"
                  />
                  <input
                    type="text"
                    required
                    placeholder="ZIP code"
                    value={form.zip}
                    onChange={(e) => updateForm('zip', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">
                Payment Information
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Card number"
                  value={form.cardNumber}
                  onChange={(e) => updateForm('cardNumber', e.target.value)}
                  className="input-field"
                  maxLength={19}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={form.cardExp}
                    onChange={(e) => updateForm('cardExp', e.target.value)}
                    className="input-field"
                    maxLength={5}
                  />
                  <input
                    type="text"
                    required
                    placeholder="CVV"
                    value={form.cardCvv}
                    onChange={(e) => updateForm('cardCvv', e.target.value)}
                    className="input-field"
                    maxLength={4}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')
                  ? 'Mock mode: any card number works (use 0000 to simulate decline)'
                  : 'Your payment is processed securely. We never store card details.'}
              </p>
            </section>

            {/* RUO Acknowledgment */}
            <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ruoAcknowledged}
                  onChange={(e) => updateForm('ruoAcknowledged', e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500"
                />
                <span className="text-sm text-amber-900">
                  <strong>Research Use Only Acknowledgment:</strong> I confirm that I
                  am a qualified researcher and that all products purchased are
                  intended for laboratory and research use only. These products are
                  not intended for human consumption, veterinary use, or any
                  therapeutic applications. I accept full responsibility for the
                  proper handling and use of these materials.
                </span>
              </label>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.variantId} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.productName} ({item.variantName}) x{item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPriceDollars(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPriceDollars(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      formatPriceDollars(shipping)
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPriceDollars(total)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 text-red-700 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatPriceDollars(total)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
