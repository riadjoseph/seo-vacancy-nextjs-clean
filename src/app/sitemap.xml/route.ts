import { createClient } from '@/lib/supabase/server'

function createJobSlug(title: string, company: string, city: string | null): string {
  const slug = `${title}-${company}-${city || 'remote'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug
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

export async function GET() {
  const supabase = await createClient()
  const baseUrl = process.env.NEXTAUTH_URL || 'https://seo-vacancy.eu'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  let allPages = [...staticPages]

  try {
    // Get all jobs for individual job pages
    const { data: jobs } = await supabase
      .from('jobs')
      .select('title, company_name, city, created_at, expires_at')
      .gt('expires_at', new Date().toISOString()) // Only non-expired jobs
      .order('created_at', { ascending: false })

    const jobPages = jobs?.map(job => ({
      url: `${baseUrl}/job/${createJobSlug(job.title, job.company_name, job.city)}`,
      lastModified: new Date(job.created_at || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    })) || []

    // Get unique cities for city pages
    const { data: cityJobs } = await supabase
      .from('jobs')
      .select('city')
      .not('city', 'is', null)
      .gt('expires_at', new Date().toISOString())

    const uniqueCities = [...new Set(cityJobs?.map(job => job.city).filter(Boolean))] as string[]
    const cityPages = uniqueCities.map(city => ({
      url: `${baseUrl}/jobs/city/${encodeURIComponent(city.toLowerCase())}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
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
    const tagPages = uniqueTags.map(tag => ({
      url: `${baseUrl}/jobs/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    }))

    allPages = [...staticPages, ...jobPages, ...cityPages, ...tagPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${escapeXml(page.url)}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  const response = new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  })

  // Remove Next.js App Router headers that are unnecessary for XML sitemaps
  response.headers.delete('Vary')
  response.headers.delete('Netlify-Vary')

  return response
}