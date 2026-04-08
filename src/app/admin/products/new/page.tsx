'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  slug: string
}

interface VariantInput {
  name: string
  sku: string
  price: string
  compareAtPrice: string
  stock: string
  weight: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    casNumber: '',
    molecularWeight: '',
    molecularFormula: '',
    sequence: '',
    purity: '99',
    form: 'Lyophilized Powder',
    storageInstructions: '-20°C, protect from light',
    shelfLife: '24 months',
    imageUrl: '',
    coaUrl: '',
    coaLabName: '',
    coaBatchNumber: '',
    status: 'DRAFT',
    categoryId: '',
    tags: '',
  })

  const [variants, setVariants] = useState<VariantInput[]>([
    { name: '5mg', sku: '', price: '', compareAtPrice: '', stock: '0', weight: '' },
  ])

  useEffect(() => {
    fetch('/api/admin/products')
      .then(() =>
        fetch('/api/products')
          .then((r) => r.json())
          .then((products: any[]) => {
            const cats = new Map<string, Category>()
            products.forEach((p: any) => {
              if (p.category && !cats.has(p.category.id)) {
                cats.set(p.category.id, p.category)
              }
            })
            setCategories(Array.from(cats.values()))
          })
      )
      .catch(() => {})
  }, [])

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateVariant(index: number, field: string, value: string) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { name: '', sku: '', price: '', compareAtPrice: '', stock: '0', weight: '' },
    ])
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) return
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          purity: form.purity ? parseFloat(form.purity) : undefined,
          tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
          variants: variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: parseFloat(v.price),
            compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice) : undefined,
            stock: parseInt(v.stock, 10),
            weight: v.weight ? parseFloat(v.weight) : undefined,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create product')
        return
      }

      router.push('/admin/products')
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-main py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-brand-navy-800">New Product</h1>
        <a href="/admin/products" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </a>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
        {/* Basic Info */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                className="input-field"
                placeholder="BPC-157 (5mg)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <input
                value={form.shortDescription}
                onChange={(e) => updateForm('shortDescription', e.target.value)}
                className="input-field"
                placeholder="Healing peptide for research applications"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={6}
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                className="input-field"
                placeholder="Full product description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => updateForm('categoryId', e.target.value)}
                  className="input-field"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateForm('status', e.target.value)}
                  className="input-field"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                value={form.tags}
                onChange={(e) => updateForm('tags', e.target.value)}
                className="input-field"
                placeholder="healing, bpc, research"
              />
            </div>
          </div>
        </section>

        {/* Scientific Details */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">Scientific Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CAS Number</label>
              <input value={form.casNumber} onChange={(e) => updateForm('casNumber', e.target.value)} className="input-field" placeholder="137525-51-0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Molecular Weight</label>
              <input value={form.molecularWeight} onChange={(e) => updateForm('molecularWeight', e.target.value)} className="input-field" placeholder="1419.53 g/mol" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Molecular Formula</label>
              <input value={form.molecularFormula} onChange={(e) => updateForm('molecularFormula', e.target.value)} className="input-field" placeholder="C62H98N16O22" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purity (%)</label>
              <input type="number" step="0.1" value={form.purity} onChange={(e) => updateForm('purity', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form</label>
              <select value={form.form} onChange={(e) => updateForm('form', e.target.value)} className="input-field">
                <option>Lyophilized Powder</option>
                <option>Liquid Solution</option>
                <option>Capsules</option>
                <option>Nasal Spray</option>
                <option>Cream</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sequence</label>
              <input value={form.sequence} onChange={(e) => updateForm('sequence', e.target.value)} className="input-field" placeholder="Gly-Glu-Pro-Pro-Pro..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Instructions</label>
              <input value={form.storageInstructions} onChange={(e) => updateForm('storageInstructions', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Life</label>
              <input value={form.shelfLife} onChange={(e) => updateForm('shelfLife', e.target.value)} className="input-field" />
            </div>
          </div>
        </section>

        {/* Media & COA */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-brand-navy-800 mb-4">Media & COA</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input value={form.imageUrl} onChange={(e) => updateForm('imageUrl', e.target.value)} className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">COA PDF URL</label>
              <input value={form.coaUrl} onChange={(e) => updateForm('coaUrl', e.target.value)} className="input-field" placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">COA Lab Name</label>
                <input value={form.coaLabName} onChange={(e) => updateForm('coaLabName', e.target.value)} className="input-field" placeholder="e.g. Janoshik Analytical" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">COA Batch Number</label>
                <input value={form.coaBatchNumber} onChange={(e) => updateForm('coaBatchNumber', e.target.value)} className="input-field" placeholder="AZ-BPC-2026-001" />
              </div>
            </div>
          </div>
        </section>

        {/* Variants */}
        <section className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-brand-navy-800">Variants</h2>
            <button type="button" onClick={addVariant} className="text-sm text-brand-teal-600 hover:text-brand-teal-700 font-medium">
              + Add Variant
            </button>
          </div>
          {variants.map((variant, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Variant {i + 1}</span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-xs text-red-500 hover:text-red-700">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <input required placeholder="Name (e.g. 5mg)" value={variant.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} className="input-field text-sm" />
                <input required placeholder="SKU" value={variant.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className="input-field text-sm" />
                <input required type="number" step="0.01" placeholder="Price" value={variant.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="input-field text-sm" />
                <input type="number" step="0.01" placeholder="Compare at price" value={variant.compareAtPrice} onChange={(e) => updateVariant(i, 'compareAtPrice', e.target.value)} className="input-field text-sm" />
                <input required type="number" placeholder="Stock" value={variant.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} className="input-field text-sm" />
                <input type="number" step="0.01" placeholder="Weight (g)" value={variant.weight} onChange={(e) => updateVariant(i, 'weight', e.target.value)} className="input-field text-sm" />
              </div>
            </div>
          ))}
        </section>

        {/* Submit */}
        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>
        )}

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Product'}
          </button>
          <a href="/admin/products" className="btn-secondary">
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
