import { createClient } from '@/lib/supabase/server'

function createJobSlug(title: string, company: string, city: string | null): string {
  const slug = `${title}-${company}-${city || 'remote'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug
}

export async function GET() {
  const supabase = await createClient()
  const baseUrl = process.env.NEXTAUTH_URL || 'https://seo-vacancy.eu'

  // Static pages
  const staticUrls = [
    baseUrl,
    `${baseUrl}/auth/signin`,
    `${baseUrl}/terms`,
  ]

  let allUrls = [...staticUrls]

  try {
    // Get all jobs for individual job pages
    const { data: jobs } = await supabase
      .from('jobs')
      .select('title, company_name, city, created_at, expires_at')
      .gt('expires_at', new Date().toISOString()) // Only non-expired jobs
      .order('created_at', { ascending: false })

    const jobUrls = jobs?.map(job =>
      `${baseUrl}/job/${createJobSlug(job.title, job.company_name, job.city)}`
    ) || []

    // Get unique cities for city pages
    const { data: cityJobs } = await supabase
      .from('jobs')
      .select('city')
      .not('city', 'is', null)
      .gt('expires_at', new Date().toISOString())

    const uniqueCities = [...new Set(cityJobs?.map(job => job.city).filter(Boolean))] as string[]
    const cityUrls = uniqueCities.map(city =>
      `${baseUrl}/jobs/city/${encodeURIComponent(city.toLowerCase())}`
    )

    // Get unique tags for tag pages
    const { data: tagJobs } = await supabase
      .from('jobs')
      .select('tags')
      .not('tags', 'is', null)
      .gt('expires_at', new Date().toISOString())

    const allTags = tagJobs?.flatMap(job => job.tags || []) || []
    const uniqueTags = [...new Set(allTags)]
    const tagUrls = uniqueTags.map(tag =>
      `${baseUrl}/jobs/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`
    )

    allUrls = [...staticUrls, ...jobUrls, ...cityUrls, ...tagUrls]
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  // Generate plain text - one URL per line
  const textSitemap = allUrls.join('\n')

  return new Response(textSitemap, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}