import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://seo-vacancy.eu'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['?q=*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}