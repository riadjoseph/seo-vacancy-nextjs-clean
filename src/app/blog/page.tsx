import Link from 'next/link'
import { allPosts } from '@/content/blog'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export const metadata = {
  title: 'Blog',
  description: 'Articles, guides, and resources for SEO professionals.',
}

export default function BlogIndexPage() {
  const posts = allPosts.sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post.slug}>
            <CardHeader>
              <Link href={`/blog/${post.slug}`} className="text-2xl font-semibold hover:text-blue-600">
                {post.title}
              </Link>
              <p className="text-sm text-gray-500" suppressHydrationWarning>
                {new Date(post.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </p>
            </CardHeader>
            {post.summary && (
              <CardContent>
                <p className="text-gray-700">{post.summary}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

