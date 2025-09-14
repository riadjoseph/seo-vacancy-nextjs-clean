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

function truncateDescription(description: string, maxLength: number = 300): string {
  if (description.length <= maxLength) return description
  return description.substring(0, maxLength).trim() + '...'
}

export async function GET() {
  const supabase = await createClient()
  const baseUrl = process.env.NEXTAUTH_URL || 'https://seo-vacancy.eu'

  try {
    // Get recent jobs (last 15 days, limit to 50 most recent)
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    const { data: jobs } = await supabase
      .from('jobs')
      .select('title, company_name, city, description, created_at, expires_at, salary_min, salary_max, tags')
      .gt('expires_at', new Date().toISOString()) // Only non-expired jobs
      .gte('created_at', fifteenDaysAgo.toISOString()) // Only recent jobs
      .order('created_at', { ascending: false })
      .limit(50)

    const buildDate = new Date().toUTCString()
    const lastBuildDate = jobs && jobs.length > 0
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

      return `    <item>
      <title>${escapeXml(`${job.title} at ${job.company_name}`)}</title>
      <description>${escapeXml(description)}</description>
      <link>${escapeXml(jobUrl)}</link>
      <guid>${escapeXml(jobUrl)}</guid>
      <pubDate>${new Date(job.created_at).toUTCString()}</pubDate>
      <category>Jobs</category>${salary ? `
      <category>${escapeXml(salary)}</category>` : ''}${location ? `
      <category>${escapeXml(location)}</category>` : ''}${tags ? `
      <category>${escapeXml(tags)}</category>` : ''}
    </item>`
    }).join('\n') || ''

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SEO Vacancy - Latest SEO Job Opportunities in Europe</title>
    <description>The latest SEO job opportunities in Europe, digital marketing, and related fields</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <pubDate>${buildDate}</pubDate>
    <ttl>1440</ttl>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>SEO Vacancy</title>
      <link>${baseUrl}</link>
    </image>
${rssItems}
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)

    // Return minimal RSS feed on error
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>SEO Vacancy - Latest Job Opportunities</title>
    <description>The latest job opportunities in SEO, digital marketing, and related fields across Europe</description>
    <link>${baseUrl}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  }
}