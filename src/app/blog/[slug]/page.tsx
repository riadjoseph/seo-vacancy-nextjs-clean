import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Breadcrumbs, generateBreadcrumbSchema, type BreadcrumbItem } from '@/components/ui/breadcrumbs'
import { findPostBySlug } from '@/content/blog'
import { author as authorProfile } from '@/content/site/author'
import { RenderModules } from '@/components/JobListModule'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = findPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.summary || undefined,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = findPostBySlug(slug)
  if (!post) notFound()

  const author = authorProfile
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'SEO Jobs', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title },
  ]
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, 'https://seo-vacancy.eu')

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <article className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <p className="text-sm text-gray-500" suppressHydrationWarning>
            {new Date(post.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
          <p className="text-sm text-gray-600">By {post.authorName || author.name}</p>
        </header>

        <Card>
          <CardContent className="pt-6 rich-article">
            <ReactMarkdown>
              {post.content}
            </ReactMarkdown>
          </CardContent>
        </Card>

        {/* Render dynamic modules (e.g., job lists) */}
        <RenderModules modules={post.modules} />
      </article>
      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.summary || undefined,
            datePublished: post.date,
            dateModified: post.date,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://seo-vacancy.eu/blog/${post.slug}`,
            },
            author,
            publisher: {
              '@type': 'Organization',
              name: 'Wake Up Happy',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </div>
  )
}
