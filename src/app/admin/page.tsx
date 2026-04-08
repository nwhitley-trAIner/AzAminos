import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
import { AdminHeader } from './admin-header'
import { formatPriceDollars } from '@/lib/utils'

export default async function AdminDashboard() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const [
    productCount,
    orderCount,
    pendingOrders,
    recentOrders,
    lowStockVariants,
    revenue,
  ] = await Promise.all([
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: true },
    }),
    prisma.variant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: { select: { name: true } } },
      orderBy: { stock: 'asc' },
      take: 10,
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'CAPTURED' },
      _sum: { total: true },
    }),
  ])

  const statusColors: Record<string, string> = {
    PENDING: 'badge-warning',
    CONFIRMED: 'badge-info',
    PROCESSING: 'badge-info',
    SHIPPED: 'badge-info',
    DELIVERED: 'badge-success',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
    REFUNDED: 'badge-danger',
  }

  return (
    <>
      <AdminHeader session={session} />
      <div className="container-main py-8">
        <h1 className="text-2xl font-bold text-brand-navy-800 mb-8">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <p className="text-sm text-gray-500">Active Products</p>
            <p className="text-3xl font-bold text-brand-navy-800">{productCount}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-3xl font-bold text-brand-navy-800">{orderCount}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="text-3xl font-bold text-amber-600">{pendingOrders}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatPriceDollars(revenue._sum.total || 0)}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-brand-navy-800">Recent Orders</h2>
              <Link href="/admin/orders" className="text-sm text-brand-teal-600 hover:text-brand-teal-700">
                View all
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatPriceDollars(order.total)}
                      </p>
                      <span className={statusColors[order.status] || 'badge'}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">
              Low Stock Alerts
            </h2>
            {lowStockVariants.length === 0 ? (
              <p className="text-gray-400 text-sm">All products well stocked</p>
            ) : (
              <div className="space-y-3">
                {lowStockVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{variant.product.name}</p>
                      <p className="text-xs text-gray-500">{variant.name} ({variant.sku})</p>
                    </div>
                    <span
                      className={
                        variant.stock === 0 ? 'badge-danger' : 'badge-warning'
                      }
                    >
                      {variant.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
