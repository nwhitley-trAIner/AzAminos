'use client'

import { useEffect, useState } from 'react'

const CONSENT_KEY = 'azaminos-checkout-consent'

export interface CheckoutConsent {
  firstName: string
  lastName: string
  email: string
  ageAcknowledged: true
  ruoAcknowledged: true
  ts: number
}

export function loadConsent(): CheckoutConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CheckoutConsent
    if (!parsed.ageAcknowledged || !parsed.ruoAcknowledged) return null
    return parsed
  } catch {
    return null
  }
}

interface CheckoutGateProps {
  onAccept: (consent: CheckoutConsent) => void
}

export function CheckoutGate({ onAccept }: CheckoutGateProps) {
  const [open, setOpen] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState(false)
  const [ruo, setRuo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const existing = loadConsent()
    if (existing) {
      onAccept(existing)
      return
    }
    setOpen(true)
  }, [onAccept])

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (!age) {
      setError('You must confirm you are 21 years of age or older.')
      return
    }
    if (!ruo) {
      setError('You must acknowledge the Research Use Only disclaimer.')
      return
    }

    const consent: CheckoutConsent = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      ageAcknowledged: true,
      ruoAcknowledged: true,
      ts: Date.now(),
    }

    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
    } catch {
      // localStorage unavailable — proceed without persistence
    }

    onAccept(consent)
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 bg-brand-navy-900/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-brand-navy-800 text-white px-6 py-5">
          <h2 className="text-xl font-semibold">Before You Continue</h2>
          <p className="text-sm text-gray-300 mt-1">
            We need a few quick acknowledgments before checkout.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                First name
              </label>
              <input
                required
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Last name
              </label>
              <input
                required
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
                autoComplete="family-name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              autoComplete="email"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer bg-gray-50 rounded-lg p-3">
            <input
              type="checkbox"
              checked={age}
              onChange={(e) => setAge(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500"
            />
            <span className="text-sm text-gray-700">
              I confirm I am <strong>21 years of age or older</strong>.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-100 rounded-lg p-3">
            <input
              type="checkbox"
              checked={ruo}
              onChange={(e) => setRuo(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500"
            />
            <span className="text-sm text-amber-900">
              I am a qualified researcher and acknowledge that all products are
              for <strong>research use only</strong> — not for human consumption,
              veterinary use, or therapeutic applications.
            </span>
          </label>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full">
            Continue to Checkout
          </button>

          <p className="text-xs text-gray-400 text-center">
            We&apos;ll remember these acknowledgments on this device for your
            future orders.
          </p>
        </form>
      </div>
    </div>
  )
}
