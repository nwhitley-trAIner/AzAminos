'use client'

import { useState } from 'react'
import { formatPriceDollars } from '@/lib/utils'

interface BulkTier {
  qty: number
  price: number
}

interface Variant {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  bulkPricing: BulkTier[] | null
}

interface VariantEditorProps {
  variant: Variant
  onUpdated?: (v: Variant) => void
}

export function VariantEditor({ variant, onUpdated }: VariantEditorProps) {
  const [price, setPrice] = useState(variant.price.toString())
  const [stock, setStock] = useState(variant.stock.toString())
  const [tiers, setTiers] = useState<{ qty: string; price: string }[]>(
    (variant.bulkPricing ?? []).map((t) => ({
      qty: t.qty.toString(),
      price: t.price.toString(),
    }))
  )
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  function addTier() {
    setTiers((prev) => [...prev, { qty: '', price: '' }])
  }

  function updateTier(i: number, field: 'qty' | 'price', value: string) {
    setTiers((prev) =>
      prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t))
    )
  }

  function removeTier(i: number) {
    setTiers((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const cleanedTiers = tiers
      .filter((t) => t.qty && t.price)
      .map((t) => ({ qty: parseInt(t.qty, 10), price: parseFloat(t.price) }))
      .sort((a, b) => a.qty - b.qty)

    const body: Record<string, unknown> = {
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      bulkPricing: cleanedTiers.length > 0 ? cleanedTiers : null,
    }

    try {
      const res = await fetch(`/api/admin/variants/${variant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        return
      }
      const updated = await res.json()
      setSavedAt(Date.now())
      onUpdated?.(updated)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-gray-100 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-sm text-brand-navy-800">{variant.name}</p>
          <p className="text-xs text-gray-400">{variant.sku}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Current: {formatPriceDollars(variant.price)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Unit price</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="input-field text-sm"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Volume Discounts</p>
            <p className="text-xs text-gray-500">
              Bulk price applies automatically when cart quantity meets the threshold.
            </p>
          </div>
          <button
            type="button"
            onClick={addTier}
            className="text-xs text-brand-teal-600 hover:text-brand-teal-700 font-medium"
          >
            + Add Tier
          </button>
        </div>

        {tiers.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-2">
            No volume discounts configured.
          </p>
        ) : (
          <div className="space-y-2">
            {tiers.map((tier, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-10">Buy</span>
                <input
                  type="number"
                  min="2"
                  placeholder="3"
                  value={tier.qty}
                  onChange={(e) => updateTier(i, 'qty', e.target.value)}
                  className="input-field text-sm w-20"
                />
                <span className="text-xs text-gray-500">+ at</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="45.00"
                  value={tier.price}
                  onChange={(e) => updateTier(i, 'price', e.target.value)}
                  className="input-field text-sm w-28"
                />
                <span className="text-xs text-gray-500">each</span>
                <button
                  type="button"
                  onClick={() => removeTier(i)}
                  className="ml-auto text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 text-xs rounded-lg p-2 mt-3">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 mt-3">
        {savedAt && Date.now() - savedAt < 4000 && (
          <span className="text-xs text-emerald-600">Saved</span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-secondary text-sm"
        >
          {saving ? 'Saving...' : 'Save Variant'}
        </button>
      </div>
    </div>
  )
}
