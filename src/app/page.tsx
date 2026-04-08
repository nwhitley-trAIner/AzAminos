import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ProductGrid } from '@/components/products/product-grid'

export const dynamic = 'force-dynamic'

const trustBadges = [
  { icon: 'shield', label: '99%+ Purity', sublabel: 'HPLC Verified' },
  { icon: 'beaker', label: 'Third-Party Tested', sublabel: 'Independent Labs' },
  { icon: 'flag', label: 'USA Made', sublabel: 'Domestic Manufacturing' },
  { icon: 'truck', label: 'Free Shipping', sublabel: 'Orders Over $99' },
  { icon: 'document', label: 'Batch COAs', sublabel: 'Every Product' },
]

function TrustIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    shield: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    beaker: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    flag: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
    truck: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    document: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  }
  return <>{icons[icon]}</>
}

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    include: {
      category: true,
      variants: {
        orderBy: { price: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy-900 via-brand-navy-800 to-brand-navy-700 text-white">
        <div className="container-main py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-brand-teal-400 font-medium text-sm uppercase tracking-widest mb-4">
              Research Peptides &middot; USA Made
            </p>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
              Premium Research Peptides Backed by{' '}
              <span className="text-brand-teal-400">Independent Testing</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Every batch independently verified with third-party Certificates of
              Analysis. 99%+ purity guaranteed. For research use only.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn-primary text-lg px-8 py-4">
                Shop Peptides
              </Link>
              <Link
                href="/coa"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                View COAs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-gray-100 bg-gray-50/50">
        <div className="container-main py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center text-center gap-2">
                <div className="text-brand-teal-600">
                  <TrustIcon icon={badge.icon} />
                </div>
                <div>
                  <p className="font-semibold text-brand-navy-800 text-sm">{badge.label}</p>
                  <p className="text-xs text-gray-500">{badge.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy-800 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Browse our selection of premium research peptides, each with batch-specific
              Certificates of Analysis from independent laboratories.
            </p>
          </div>
          <ProductGrid products={products} />
          <div className="text-center mt-10">
            <Link href="/products" className="btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-navy-800 mb-4">
              Why Researchers Choose AZ Aminos
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-brand-teal-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-navy-800 mb-2">
                Verified Purity
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Every product tested by independent, third-party laboratories.
                Batch-specific COAs available for download with HPLC and MS verification.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-brand-teal-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-navy-800 mb-2">
                USA Manufactured
              </h3>
              <p className="text-gray-600 leading-relaxed">
                All peptides manufactured in the United States under strict quality
                controls. No imported or repackaged compounds.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-brand-teal-50 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-brand-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-brand-navy-800 mb-2">
                Fast, Discreet Shipping
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Same-day processing on orders placed before 2PM EST. Free shipping
                on orders over $99. Discreet, temperature-controlled packaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RUO Banner */}
      <section className="bg-brand-navy-800 text-white py-8">
        <div className="container-main text-center">
          <p className="text-sm text-gray-300 max-w-3xl mx-auto">
            <strong className="text-white">Research Use Only:</strong> All products
            are intended for laboratory and research use only. Not for human
            consumption. By browsing this site, you confirm you are a qualified
            researcher.
          </p>
        </div>
      </section>
    </>
  )
}
