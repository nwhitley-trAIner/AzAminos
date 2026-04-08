import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartProvider } from '@/lib/cart-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'AZ Aminos | Premium Research Peptides — USA Made, Third-Party Tested',
  description:
    'Premium research peptides backed by independent third-party testing and batch-specific Certificates of Analysis. USA made. For research use only.',
  keywords: ['research peptides', 'peptides', 'BPC-157', 'TB-500', 'COA', 'third-party tested'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}
