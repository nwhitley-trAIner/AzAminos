import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-brand-navy-900 text-gray-300">
      <div className="container-main py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Image
              src="/logo.png"
              alt="AZ Aminos"
              width={140}
              height={42}
              className="h-10 w-auto brightness-0 invert mb-4"
            />
            <p className="text-sm text-gray-400 leading-relaxed">
              Premium research peptides backed by third-party testing
              and batch-specific Certificates of Analysis.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-brand-teal-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=healing"
                  className="hover:text-brand-teal-400 transition-colors"
                >
                  Healing Peptides
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=growth-hormone"
                  className="hover:text-brand-teal-400 transition-colors"
                >
                  Growth Hormone
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=nootropics"
                  className="hover:text-brand-teal-400 transition-colors"
                >
                  Nootropics
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shipping" className="hover:text-brand-teal-400 transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-teal-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-teal-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/coa" className="hover:text-brand-teal-400 transition-colors">
                  Certificates of Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-brand-teal-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-teal-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-brand-teal-400 transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer + Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="bg-brand-navy-800 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong className="text-gray-300">Research Use Only:</strong> All
              products sold by AZ Aminos are intended for laboratory and
              research use only. They are not intended for human consumption,
              veterinary use, or any therapeutic applications. By purchasing
              from this site, you acknowledge that you are a qualified
              researcher and agree to use these products solely for research
              purposes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} AZ Aminos. All rights reserved.</p>
            <p>USA Made &middot; Third-Party Tested &middot; Batch-Specific COAs</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
