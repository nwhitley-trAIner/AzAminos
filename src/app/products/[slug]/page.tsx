import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AddToCartButton } from './add-to-cart-button'

export const dynamic = 'force-dynamic'

interface PDPProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PDPProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  })
  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.name} | AZ Aminos`,
    description: product.shortDescription || product.description.slice(0, 160),
  }
}

export default async function ProductDetailPage({ params }: PDPProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      variants: { orderBy: { price: 'asc' } },
    },
  })

  if (!product) notFound()

  const specs = [
    { label: 'CAS Number', value: product.casNumber },
    { label: 'Molecular Weight', value: product.molecularWeight },
    { label: 'Molecular Formula', value: product.molecularFormula },
    { label: 'Sequence', value: product.sequence },
    { label: 'Purity', value: product.purity ? `${product.purity}%` : null },
    { label: 'Form', value: product.form },
    { label: 'Storage', value: product.storageInstructions },
    { label: 'Shelf Life', value: product.shelfLife },
  ].filter((s) => s.value)

  return (
    <div className="container-main py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <a href="/products" className="hover:text-brand-teal-600">
          Products
        </a>
        <span className="mx-2">/</span>
        <a
          href={`/products?category=${product.category.slug}`}
          className="hover:text-brand-teal-600"
        >
          {product.category.name}
        </a>
        <span className="mx-2">/</span>
        <span className="text-brand-navy-800">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-24 h-24 text-gray-300"
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
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-info">{product.category.name}</span>
            {product.purity && (
              <span className="badge-success">{product.purity}% Purity</span>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-brand-navy-800 mb-4">
            {product.name}
          </h1>

          {product.shortDescription && (
            <p className="text-lg text-gray-600 mb-6">{product.shortDescription}</p>
          )}

          {/* COA Badge */}
          {product.coaUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-emerald-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-emerald-800">Certificate of Analysis Available</p>
                  <p className="text-sm text-emerald-600">
                    {product.coaLabName && `Tested by ${product.coaLabName}`}
                    {product.coaBatchNumber && ` · Batch: ${product.coaBatchNumber}`}
                  </p>
                </div>
                <a
                  href={product.coaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-sm font-medium text-emerald-700 hover:text-emerald-900 underline"
                >
                  View COA
                </a>
              </div>
            </div>
          )}

          {/* Variant Selector + Add to Cart */}
          <AddToCartButton product={product as any} />

          {/* Specifications */}
          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">
                Specifications
              </h2>
              <dl className="divide-y divide-gray-100">
                {specs.map((spec) => (
                  <div key={spec.label} className="py-3 flex justify-between">
                    <dt className="text-sm text-gray-500">{spec.label}</dt>
                    <dd className="text-sm font-medium text-brand-navy-800 text-right max-w-[60%]">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">
              Research Information
            </h2>
            <div className="prose prose-sm text-gray-600 max-w-none">
              {product.description.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* RUO Disclaimer */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Research Use Only:</strong> {product.ruoDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
