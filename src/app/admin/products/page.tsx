import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
import { AdminHeader } from '../admin-header'
import { formatPriceDollars } from '@/lib/utils'

export default async function AdminProductsPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: { orderBy: { price: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const statusColors: Record<string, string> = {
    DRAFT: 'badge bg-gray-100 text-gray-600',
    ACTIVE: 'badge-success',
    OUT_OF_STOCK: 'badge-danger',
    DISCONTINUED: 'badge bg-gray-100 text-gray-400',
  }

  return (
    <>
      <AdminHeader session={session} />
      <div className="container-main py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-brand-navy-800">Products</h1>
          <Link href="/admin/products/new" className="btn-primary">
            Add Product
          </Link>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Price</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Stock</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right p-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0
                )
                const lowestPrice = product.variants[0]?.price || 0

                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-medium text-brand-navy-800">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {product.variants.map((v) => v.sku).join(', ')}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {product.category.name}
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {product.variants.length > 1 ? 'From ' : ''}
                      {formatPriceDollars(lowestPrice)}
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          totalStock === 0
                            ? 'text-red-600 font-medium text-sm'
                            : totalStock <= 5
                              ? 'text-amber-600 font-medium text-sm'
                              : 'text-sm text-gray-600'
                        }
                      >
                        {totalStock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={statusColors[product.status]}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm text-brand-teal-600 hover:text-brand-teal-700 font-medium"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No products yet.{' '}
                    <Link
                      href="/admin/products/new"
                      className="text-brand-teal-600"
                    >
                      Add your first product
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
