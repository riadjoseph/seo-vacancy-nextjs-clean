import { createPublicClient } from '@/lib/supabase/public'
import { createTagSlug } from '@/utils/tagUtils'
import { allPosts } from '@/content/blog'

function createJobSlug(title: string, company: string, city: string | null): string {
  const slug = `${title}-${company}-${city || 'remote'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug
}

interface SitemapEntry {
  url: string
  lastModified: Date
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

export async function GET() {
  const supabase = createPublicClient()
  const baseUrl = process.env.NEXTAUTH_URL || 'https://seo-vacancy.eu'

  // Important content pages only
  const staticPages: SitemapEntry[] = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools/indexnow`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Blog posts
  const blogPages: SitemapEntry[] = allPosts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  let allPages = [...staticPages, ...blogPages]

  try {
    // Get all jobs for individual job pages
    const { data: jobs } = await supabase
      .from('jobs')
      .select('title, company_name, city, created_at, expires_at')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    const jobPages: SitemapEntry[] = jobs?.map(job => ({
      url: `${baseUrl}/job/${createJobSlug(job.title, job.company_name, job.city)}`,
      lastModified: new Date(job.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []

    // Get unique cities for city pages
    const { data: cityJobs } = await supabase
      .from('jobs')
      .select('city')
      .not('city', 'is', null)
      .gt('expires_at', new Date().toISOString())

    const uniqueCities = [...new Set(cityJobs?.map(job => job.city).filter(Boolean))] as string[]
    const cityPages: SitemapEntry[] = uniqueCities.map(city => ({
      url: `${baseUrl}/jobs/city/${encodeURIComponent(city.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))

    // Get unique tags for tag pages
    const { data: tagJobs } = await supabase
      .from('jobs')
      .select('tags')
      .not('tags', 'is', null)
      .gt('expires_at', new Date().toISOString())

    const allTags = tagJobs?.flatMap(job => job.tags || []) || []
    const uniqueTags = [...new Set(allTags)]
    const tagPages: SitemapEntry[] = uniqueTags.map(tag => ({
      url: `${baseUrl}/jobs/tag/${createTagSlug(tag)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    }))

    allPages = [...staticPages, ...blogPages, ...jobPages, ...cityPages, ...tagPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  // Generate XML with proper XSD schema location (no leading whitespace)
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
    '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n' +
    '                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n' +
    allPages.map(page =>
      `  <url>\n` +
      `    <loc>${escapeXml(page.url)}</loc>\n` +
      `    <lastmod>${page.lastModified.toISOString()}</lastmod>\n` +
      `    <changefreq>${page.changeFrequency}</changefreq>\n` +
      `    <priority>${page.priority}</priority>\n` +
      `  </url>`
    ).join('\n') + '\n' +
    '</urlset>'

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600'
    }
  })
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}
