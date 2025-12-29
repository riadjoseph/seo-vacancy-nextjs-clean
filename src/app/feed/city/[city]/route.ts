import { createPublicClient } from '@/lib/supabase/public'
import { notFound } from 'next/navigation'

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

function truncateDescription(description: string, maxLength: number = 300): string {
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength).trim() + '...'
}

function capitalizeCity(city: string): string {
  return city
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ city: string }> }
) {
  const { city } = await params
  const supabase = createPublicClient()
  const baseUrl = process.env.NEXTAUTH_URL || 'https://seo-vacancy.eu'
  const decodedCity = decodeURIComponent(city).toLowerCase()
  const displayCity = capitalizeCity(decodedCity)

  try {
    // Filter out expired jobs
    const currentDate = new Date().toISOString()
    const expiredFilter = `expires_at.is.null,expires_at.gte.${currentDate}`

    // Get jobs for this city
    const { data: jobs, count } = await supabase
      .from('jobs')
      .select('title, company_name, city, description, created_at, expires_at, salary_min, salary_max, tags', { count: 'exact' })
      .ilike('city', decodedCity)
      .or(expiredFilter)
      .order('created_at', { ascending: false })
      .limit(50)

    // Return 404 if no jobs
    if (!jobs || (count !== null && count < 1)) {
      notFound()
    }

    const buildDate = new Date().toUTCString()
    const lastBuildDate = jobs && jobs.length > 0 && jobs[0].created_at
      ? new Date(jobs[0].created_at).toUTCString()
      : buildDate

    // Generate RSS XML
    const rssItems = jobs?.map(job => {
      const jobUrl = `${baseUrl}/job/${createJobSlug(job.title, job.company_name, job.city)}`
      const salary = job.salary_min && job.salary_max
        ? `€${job.salary_min.toLocaleString()} - €${job.salary_max.toLocaleString()}`
        : job.salary_min
        ? `From €${job.salary_min.toLocaleString()}`
        : job.salary_max
        ? `Up to €${job.salary_max.toLocaleString()}`
        : ''

      const location = job.city || 'Remote'
      const tags = job.tags?.join(', ') || ''

      const description = job.description
        ? truncateDescription(job.description)
        : `${job.title} position at ${job.company_name} in ${location}`

      const pubDate = job.created_at ? new Date(job.created_at).toUTCString() : buildDate

      return `    <item>
      <title>${escapeXml(`${job.title} at ${job.company_name}`)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(jobUrl)}</link>
      <guid>${escapeXml(jobUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>Jobs</category>${salary ? `
      <category>${escapeXml(salary)}</category>` : ''}${location ? `
      <category>${escapeXml(location)}</category>` : ''}${tags ? `
      <category>${escapeXml(tags)}</category>` : ''}
    </item>`
    }).join('\n') || ''

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SEO Vacancy - ${escapeXml(displayCity)} - Latest SEO Jobs</title>
    <description>Latest SEO job opportunities in ${escapeXml(displayCity)}</description>
    <link>${baseUrl}/jobs/city/${city}</link>
    <atom:link href="${baseUrl}/feed/city/${city}" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>1440</ttl>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>SEO Vacancy - ${escapeXml(displayCity)}</title>
      <link>${baseUrl}/jobs/city/${city}</link>
    </image>
${rssItems}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error(`Error generating RSS feed for city ${city}:`, error)
    notFound()
  }
}
