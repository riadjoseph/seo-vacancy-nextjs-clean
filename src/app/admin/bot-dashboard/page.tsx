import { Metadata } from 'next'
import BotDashboard from '@/components/BotDashboard'
import { Breadcrumbs, generateBreadcrumbSchema, type BreadcrumbItem } from '@/components/ui/breadcrumbs'

export const metadata: Metadata = {
  title: 'Bot Activity Dashboard | SEO Vacancy',
  description: 'Real-time tracking and analytics of AI bots, search engine crawlers, and automated visitors',
  robots: 'noindex, nofollow'
}

export default function BotDashboardPage() {
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'SEO Jobs', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Bot Dashboard' }
  ]

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, 'https://seo-vacancy.eu')

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Dashboard */}
        <BotDashboard />

        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            🤖 Advanced bot tracking by{' '}
            <a
              href="https://linkedin.com/in/riadjoseph"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Riad JOSEPH
            </a>
            {' '}• SEO Consultant
          </p>
          <p className="mt-2">
            Tracking AI bots, search engines, and crawlers with comprehensive analytics
          </p>
        </div>
      </div>
    </>
  )
}