import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'HeyBCA - Calicut University BCA Notes, PYQs & Study Materials',
  description: 'Download Calicut University FYUGP BCA syllabus notes, semester study materials, and previous year question papers (PYQs) for free on HeyBCA.',
  alternates: {
    canonical: 'https://bca.microxlearn.online',
  },
  openGraph: {
    title: 'HeyBCA - Calicut University BCA Notes, PYQs & Study Materials',
    description: 'Download Calicut University FYUGP BCA syllabus notes, semester study materials, and previous year question papers (PYQs) for free on HeyBCA.',
    url: 'https://bca.microxlearn.online',
    siteName: 'HeyBCA',
    type: 'website',
    images: [
      {
        url: 'https://bca.microxlearn.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HeyBCA Notes & Study Materials Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeyBCA - Calicut University BCA Notes, PYQs & Study Materials',
    description: 'Download Calicut University FYUGP BCA syllabus notes, semester study materials, and previous year question papers (PYQs) for free on HeyBCA.',
    images: ['https://bca.microxlearn.online/og-image.png'],
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://bca.microxlearn.online/#website',
        'url': 'https://bca.microxlearn.online/',
        'name': 'HeyBCA',
        'description': 'Download Calicut University FYUGP BCA Notes, Semester Notes, PYQs, and Study Materials.',
        'publisher': {
          '@id': 'https://bca.microxlearn.online/#organization',
        },
        'potentialAction': [
          {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': 'https://bca.microxlearn.online/?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        ],
      },
      {
        '@type': 'Organization',
        '@id': 'https://bca.microxlearn.online/#organization',
        'name': 'HeyBCA',
        'url': 'https://bca.microxlearn.online/',
        'logo': 'https://bca.microxlearn.online/favicon.ico',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          HeyBCA - Study Materials
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl">
          Access high-quality study resources for Calicut University BCA students. Download FYUGP BCA notes, syllabus summaries, and previous year question papers to boost your academic prep.
        </p>
      </div>

      <HomeClient />

      {/* Semantic E-E-A-T Content Section */}
      <section className="bg-white border-t border-gray-200 py-16 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              About HeyBCA Study Portal
            </h2>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              <strong>HeyBCA</strong> is a dedicated collaborative platform built to provide Calicut University Bachelor of Computer Applications (BCA) students with reliable academic resources. Our collection includes hand-picked notes matching the new <strong>Four Year Undergraduate Programme (FYUGP)</strong> curriculum, laboratory records, and solved previous year question papers (PYQs).
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-2">Verified Content Quality & E-E-A-T Standards</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              All materials uploaded to the primary database of HeyBCA are strictly reviewed against standard university regulations. We focus on academic integrity and provide transparency with download counts and user contribution logs.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-gray-700">
              <span className="bg-gray-100 px-3 py-1 rounded-full">Calicut University BCA</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">FYUGP Semester Notes</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">Verified Solved PYQs</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">Collaborative Workspaces</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
