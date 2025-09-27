import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Breadcrumbs, generateBreadcrumbSchema, type BreadcrumbItem } from '@/components/ui/breadcrumbs'

export const metadata = {
  title: 'Tools',
  description: 'Utilities for SEO practitioners: submit URLs to IndexNow and more.',
}

export default function ToolsIndexPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {(() => {
        const items: BreadcrumbItem[] = [
          { label: 'SEO Jobs', href: '/' },
          { label: 'Tools' },
        ]
        const schema = generateBreadcrumbSchema(items, 'https://seo-vacancy.eu')
        return (
          <>
            <div className="mb-4">
              <Breadcrumbs items={items} />
            </div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
          </>
        )
      })()}
      <h1 className="text-3xl font-bold mb-6">Tools</h1>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">IndexNow Submitter</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300 mb-3">Submit up to 50 URLs to IndexNow. Provide your key and URLs, and we'll send them to the IndexNow API.</p>
            <Link href="/tools/indexnow" className="text-blue-600 hover:text-blue-800 underline">
              Open IndexNow Tool
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
