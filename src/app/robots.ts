import { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://seo-vacancy.eu'
  const supabase = createPublicClient()

  // Get cities with 3+ jobs for city feeds
  const currentDate = new Date().toISOString()
  const expiredFilter = `expires_at.is.null,expires_at.gte.${currentDate}`

  const { data: jobs } = await supabase
    .from('jobs')
    .select('city')
    .or(expiredFilter)

  // Count jobs per city
  const cityJobCounts = new Map<string, number>()
  jobs?.forEach(job => {
    if (job.city) {
      const city = job.city.toLowerCase()
      cityJobCounts.set(city, (cityJobCounts.get(city) || 0) + 1)
    }
  })

  // Get cities with 3+ jobs
  const eligibleCities = Array.from(cityJobCounts.entries())
    .filter(([, count]) => count >= 3)
    .map(([city]) => city)
    .sort()

  // Build sitemaps array
  const sitemaps = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap.txt`,
    `${baseUrl}/feed.xml`,
    `${baseUrl}/llms.txt`,
    ...eligibleCities.map(city => `${baseUrl}/feed/city/${encodeURIComponent(city)}`)
  ]

  return {
    rules: {
      userAgent: '*',
      disallow: [
        '*/search?q=*',          // Search query parameters
        '*?_rsc=*',      // Next.js RSC cache-busting parameters
        '/post-job',
        '/my-jobs',
        '*/auth/*',     // Share link parameters
        '/api/*',       // All API endpoints (security)
      ],
    },
    sitemap: sitemaps,
  }
}
