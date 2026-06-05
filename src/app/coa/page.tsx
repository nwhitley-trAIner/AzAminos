import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Certificates of Analysis | AZ Aminos',
  description:
    'Download batch-specific Certificates of Analysis for every AZ Aminos research peptide. Independent US lab verification, HPLC and mass-spec results.',
}

export default async function COAPage() {
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      coaUrl: { not: null },
    },
    include: { category: true },
    orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
  })

  return (
    <div className="container-main py-8 lg:py-12">
      <div className="max-w-3xl mb-10">
        <p className="text-brand-teal-600 font-medium text-sm uppercase tracking-widest mb-3">
          Independently Verified
        </p>
        <h1 className="text-3xl lg:text-4xl font-bold text-brand-navy-800 mb-4">
          Certificates of Analysis
        </h1>
        <p className="text-gray-600 leading-relaxed">
          Every batch we ship is independently tested by accredited US
          laboratories. Download the COA for any product below — each report
          includes HPLC purity, mass-spec confirmation, and batch traceability.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <p className="text-gray-500">
            No COAs are currently published. Check back soon — every active
            product will have a downloadable certificate here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-gray-100 rounded-xl">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Lab
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  COA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-medium text-brand-navy-800 hover:text-brand-teal-600 transition-colors"
                    >
                      {product.name}
                    </Link>
                    {product.purity && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {product.purity}% purity
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {product.coaBatchNumber || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {product.coaLabName || '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={product.coaUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-900"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-12 bg-emerald-50 border border-emerald-100 rounded-xl p-6">
        <h2 className="font-semibold text-emerald-900 mb-2">
          What&apos;s in a COA?
        </h2>
        <ul className="space-y-1.5 text-sm text-emerald-800">
          <li>&middot; HPLC purity analysis (typically 99%+)</li>
          <li>&middot; Mass spectrometry confirmation of molecular weight</li>
          <li>&middot; Batch identifier matching the lot you receive</li>
          <li>&middot; Independent third-party laboratory signature</li>
        </ul>
      </div>
    </div>
  )
}
