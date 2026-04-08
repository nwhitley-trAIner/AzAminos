'use client'

import { useState, useEffect } from 'react'
import { formatPriceDollars } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  status: string
  email: string
  shippingName: string
  total: number
  paymentStatus: string
  paymentMethod: string | null
  trackingNumber: string | null
  createdAt: string
  items: { productName: string; variantName: string; quantity: number; price: number }[]
}

const STATUS_OPTIONS = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
  'DELIVERED', 'COMPLETED', 'CANCELLED', 'REFUNDED',
]

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  async function fetchOrders() {
    setLoading(true)
    const params = filterStatus ? `?status=${filterStatus}` : ''
    const res = await fetch(`/api/admin/orders${params}`)
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders)
    }
    setLoading(false)
  }

  async function updateOrder(orderId: string, updates: Record<string, string>) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      fetchOrders()
    }
  }

  return (
    <div className="container-main py-8">
      <h1 className="text-2xl font-bold text-brand-navy-800 mb-8">Orders</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterStatus('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !filterStatus ? 'bg-brand-navy-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === status ? 'bg-brand-navy-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 py-8 text-center">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No orders found</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 text-sm font-medium text-gray-500">Order</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Payment</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Tracking</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <>
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() =>
                      setExpandedOrder(expandedOrder === order.id ? null : order.id)
                    }
                  >
                    <td className="p-4 font-medium text-sm font-mono">
                      {order.orderNumber}
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{order.shippingName}</p>
                      <p className="text-xs text-gray-400">{order.email}</p>
                    </td>
                    <td className="p-4 font-semibold text-sm">
                      {formatPriceDollars(order.total)}
                    </td>
                    <td className="p-4">
                      <span className={order.paymentStatus === 'CAPTURED' ? 'badge-success' : 'badge-warning'}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          updateOrder(order.id, { status: e.target.value })
                        }
                        className="text-sm border border-gray-200 rounded px-2 py-1"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      {order.trackingNumber ? (
                        <span className="text-xs font-mono text-gray-600">
                          {order.trackingNumber}
                        </span>
                      ) : (
                        <input
                          type="text"
                          placeholder="Add tracking"
                          className="text-xs border border-gray-200 rounded px-2 py-1 w-28"
                          onClick={(e) => e.stopPropagation()}
                          onBlur={(e) => {
                            if (e.target.value) {
                              updateOrder(order.id, { trackingNumber: e.target.value })
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement
                              if (target.value) {
                                updateOrder(order.id, { trackingNumber: target.value })
                              }
                            }
                          }}
                        />
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                  {expandedOrder === order.id && (
                    <tr key={`${order.id}-detail`}>
                      <td colSpan={7} className="bg-gray-50 p-4 border-b">
                        <div className="text-sm space-y-1">
                          <p className="font-medium text-gray-700 mb-2">Order Items:</p>
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-gray-600">
                              <span>{item.productName} ({item.variantName}) x{item.quantity}</span>
                              <span>{formatPriceDollars(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
