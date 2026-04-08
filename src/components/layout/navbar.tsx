'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="container-main">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="AZ Aminos"
              width={160}
              height={48}
              className="h-10 lg:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/products"
              className="text-brand-navy-700 hover:text-brand-teal-600 font-medium transition-colors"
            >
              Products
            </Link>
            <Link
              href="/products?category=healing"
              className="text-brand-navy-700 hover:text-brand-teal-600 font-medium transition-colors"
            >
              Healing
            </Link>
            <Link
              href="/products?category=growth-hormone"
              className="text-brand-navy-700 hover:text-brand-teal-600 font-medium transition-colors"
            >
              Growth Hormone
            </Link>
            <Link
              href="/products?category=nootropics"
              className="text-brand-navy-700 hover:text-brand-teal-600 font-medium transition-colors"
            >
              Nootropics
            </Link>
          </div>

          {/* Cart + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-brand-navy-700 hover:text-brand-teal-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-teal-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4 space-y-3">
            <Link
              href="/products"
              className="block text-brand-navy-700 hover:text-brand-teal-600 font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              All Products
            </Link>
            <Link
              href="/products?category=healing"
              className="block text-brand-navy-700 hover:text-brand-teal-600 font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              Healing
            </Link>
            <Link
              href="/products?category=growth-hormone"
              className="block text-brand-navy-700 hover:text-brand-teal-600 font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              Growth Hormone
            </Link>
            <Link
              href="/products?category=nootropics"
              className="block text-brand-navy-700 hover:text-brand-teal-600 font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              Nootropics
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
