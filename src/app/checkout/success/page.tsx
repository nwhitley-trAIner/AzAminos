import Link from 'next/link'

interface SuccessPageProps {
  searchParams: { order?: string }
}

export default function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const orderNumber = searchParams.order || 'Unknown'

  return (
    <div className="container-main py-16 lg:py-24">
      <div className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-brand-navy-800 mb-4">
          Order Confirmed
        </h1>

        <p className="text-gray-600 mb-2">
          Thank you for your order. Your order number is:
        </p>

        <p className="text-2xl font-mono font-bold text-brand-teal-600 mb-6">
          {orderNumber}
        </p>

        <p className="text-gray-500 text-sm mb-8">
          A confirmation email has been sent with your order details and tracking
          information. Orders placed before 2PM EST ship same day.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
          <p className="text-sm text-amber-800">
            <strong>Research Use Only:</strong> Your RUO acknowledgment has been
            recorded with this order. All products are for laboratory and research
            use only.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/products" className="btn-primary">
            Continue Shopping
          </Link>
          <Link href="/" className="btn-secondary">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
