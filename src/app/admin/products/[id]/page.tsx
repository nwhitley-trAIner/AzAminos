'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { formatPriceDollars } from '@/lib/utils'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Record<string, any>>({})

  useEffect(() => {
    fetch(`/api/admin/products/${productId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((data) => {
        setProduct(data)
        setForm({
          name: data.name,
          description: data.description,
          shortDescription: data.shortDescription || '',
          casNumber: data.casNumber || '',
          purity: data.purity?.toString() || '',
          form: data.form,
          status: data.status,
          imageUrl: data.imageUrl || '',
          coaUrl: data.coaUrl || '',
          coaLabName: data.coaLabName || '',
          coaBatchNumber: data.coaBatchNumber || '',
          tags: data.tags?.join(', ') || '',
        })
        setLoading(false)
      })
      .catch(() => {
        setError('Product not found')
        setLoading(false)
      })
  }, [productId])

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          purity: form.purity ? parseFloat(form.purity) : undefined,
          tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()) : [],
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update')
        return
      }

      router.push('/admin/products')
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.push('/admin/products')
      }
    } catch {
      setError('Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="container-main py-16 text-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-main py-16 text-center">
        <p className="text-red-500">{error || 'Product not found'}</p>
        <a href="/admin/products" className="btn-secondary mt-4 inline-block">Back</a>
      </div>
    )
  }

  return (
    <div className="container-main py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-brand-navy-800">
          Edit: {product.name}
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={handleDelete} className="btn-danger text-sm">
            Delete Product
          </button>
          <a href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </a>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-3xl space-y-6">
        <section className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-2">Product Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input required value={form.name || ''} onChange={(e) => updateForm('name', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <input value={form.shortDescription || ''} onChange={(e) => updateForm('shortDescription', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={6} value={form.description || ''} onChange={(e) => updateForm('description', e.target.value)} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status || 'DRAFT'} onChange={(e) => updateForm('status', e.target.value)} className="input-field">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purity (%)</label>
              <input type="number" step="0.1" value={form.purity || ''} onChange={(e) => updateForm('purity', e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input value={form.imageUrl || ''} onChange={(e) => updateForm('imageUrl', e.target.value)} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">COA URL</label>
              <input value={form.coaUrl || ''} onChange={(e) => updateForm('coaUrl', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">COA Lab</label>
              <input value={form.coaLabName || ''} onChange={(e) => updateForm('coaLabName', e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input value={form.tags || ''} onChange={(e) => updateForm('tags', e.target.value)} className="input-field" placeholder="healing, bpc" />
          </div>
        </section>

        {/* Variant Summary (read-only for now) */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Variants</h2>
          <div className="space-y-2">
            {product.variants?.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div>
                  <span className="font-medium text-sm">{v.name}</span>
                  <span className="text-xs text-gray-400 ml-2">({v.sku})</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{formatPriceDollars(v.price)}</span>
                  <span className={v.stock === 0 ? 'text-red-500' : 'text-gray-600'}>
                    Stock: {v.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Variant management (add/edit/remove variants) coming soon. Use the API directly for now.
          </p>
        </section>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>
        )}

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
