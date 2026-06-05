import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | AZ Aminos — Research Peptides',
  description:
    'AZ Aminos delivers premium research peptides backed by independent US lab testing and batch-specific Certificates of Analysis.',
}

export default function AboutPage() {
  return (
    <div className="container-main py-12 lg:py-20">
      <div className="max-w-3xl">
        <p className="text-brand-teal-600 font-medium text-sm uppercase tracking-widest mb-4">
          About AZ Aminos
        </p>
        <h1 className="text-4xl lg:text-5xl font-bold text-brand-navy-800 mb-6">
          Built on Verified Quality
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          AZ Aminos exists to give research professionals confidence in every
          compound they receive. Every batch we sell is independently verified
          in accredited US laboratories — no shortcuts, no exceptions.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="font-semibold text-brand-navy-800 mb-2">
            Tested in US Labs
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Every batch independently analyzed by accredited US laboratories
            using HPLC and mass spectrometry. We publish the COA for every lot.
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="font-semibold text-brand-navy-800 mb-2">
            Shipped from the USA
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Same-day processing on orders placed before 2PM EST. Discreet,
            temperature-controlled packaging from our US fulfillment center.
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="font-semibold text-brand-navy-800 mb-2">
            Research Use Only
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            All products are sold strictly for laboratory and research use. Not
            for human consumption, veterinary use, or therapeutic application.
          </p>
        </div>
      </div>

      <div className="mt-16 bg-gray-50 rounded-2xl p-8 lg:p-12">
        <h2 className="text-2xl font-bold text-brand-navy-800 mb-4">
          Our Standards
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            We exclusively source compounds that meet 99%+ purity benchmarks.
            Before any product reaches our catalog, we pull a sample from the
            production lot and send it to an independent lab for verification.
          </p>
          <p>
            That COA — including HPLC traces, mass spec, and batch identifiers —
            is then attached to every unit sold from that lot. You can download
            the certificate for any product you receive directly from our{' '}
            <Link
              href="/coa"
              className="text-brand-teal-600 hover:text-brand-teal-700 font-medium underline"
            >
              COA library
            </Link>
            .
          </p>
          <p>
            If a batch doesn&apos;t meet our specification, it doesn&apos;t ship.
            That standard is non-negotiable.
          </p>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-brand-navy-800 mb-4">
          Browse Our Catalog
        </h2>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          See every peptide we stock, with full specifications and batch-specific
          Certificates of Analysis.
        </p>
        <Link href="/products" className="btn-primary">
          Shop Research Peptides
        </Link>
      </div>
    </div>
  )
}
