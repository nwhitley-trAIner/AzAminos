'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { AdminSession } from '@/lib/admin-auth'

interface AdminHeaderProps {
  session: AdminSession
}

export function AdminHeader({ session }: AdminHeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <header className="bg-brand-navy-900 text-white">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="AZ Aminos"
                width={120}
                height={36}
                className="h-8 w-auto brightness-0 invert"
              />
              <span className="text-xs bg-brand-teal-600 px-2 py-0.5 rounded font-medium">
                ADMIN
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link
                href="/admin/products"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Products
              </Link>
              <Link
                href="/admin/orders"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Orders
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {session.name} ({session.role})
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
              target="_blank"
            >
              View Store
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
