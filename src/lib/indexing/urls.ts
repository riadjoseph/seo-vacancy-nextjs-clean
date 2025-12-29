// URL building utilities for indexing

/**
 * Get the base URL for the site
 * Priority: NEXT_PUBLIC_BASE_URL > VERCEL_URL > default
 */
export function getBaseUrl(): string {
  // Use explicit base URL if set
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  // Use Vercel URL in preview/production
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Default for production
  return 'https://seo-vacancy.eu'
}

/**
 * Build job page URL from slug
 */
export function buildJobUrl(slug: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/job/${slug}`
}

/**
 * Build city page URL
 */
export function buildCityUrl(city: string): string {
  const baseUrl = getBaseUrl()
  const cityPath = encodeURIComponent(city.toLowerCase())
  return `${baseUrl}/jobs/city/${cityPath}`
}

/**
 * Build tag page URL
 */
export function buildTagUrl(tag: string): string {
  const baseUrl = getBaseUrl()
  // Simple slug generation for tags
  const tagSlug = tag
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  return `${baseUrl}/jobs/tag/${tagSlug}`
}
