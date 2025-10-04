import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createTagSlug } from '@/utils/tagUtils'
import { allPosts } from '@/content/blog'

function createJobSlug(title: string, company: string, city: string | null): string {
  const slug = `${title}-${company}-${city || 'remote'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = process.env.NEXTAUTH_URL || 'https://seo-vacancy.eu'

  // Important content pages only (removed non-essential: /auth, /terms, /privacy, /contact, /about)
  const staticPages: MetadataRoute.Sitemap = [
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
  const blogPages: MetadataRoute.Sitemap = allPosts.map(post => ({
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
      .gt('expires_at', new Date().toISOString()) // Only non-expired jobs
      .order('created_at', { ascending: false })

    const jobPages: MetadataRoute.Sitemap = jobs?.map(job => ({
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
    const cityPages: MetadataRoute.Sitemap = uniqueCities.map(city => ({
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
    const tagPages: MetadataRoute.Sitemap = uniqueTags.map(tag => ({
      url: `${baseUrl}/jobs/tag/${createTagSlug(tag)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    }))

    allPages = [...staticPages, ...blogPages, ...jobPages, ...cityPages, ...tagPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return allPages
}