import { NextRequest, NextResponse } from 'next/server'

// Apply CDN caching headers for SSR HTML responses on Netlify.
// netlify.toml headers do not affect SSR responses, so we set them here.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip APIs, Next internals, and static assets (but NOT .txt or .xml files)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(?:md|png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map|json|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  // Pass pathname to server components (used by Footer for context-aware city links)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)
  const res = NextResponse.next({ request: { headers: requestHeaders } })

  // For sitemaps, robots, and feeds: use simple Vary header only
  if (
    pathname === '/sitemap.xml' ||
    pathname === '/sitemap.txt' ||
    pathname === '/robots.txt' ||
    pathname === '/feed.xml' ||
    pathname.startsWith('/feed/')
  ) {
    res.headers.set('Vary', 'Accept-Encoding')
    return res
  }

  // Route-specific caching (same TTL for browsers and CDN for simplicity)
  if (
    pathname === '/' ||
    pathname.startsWith('/jobs/city/') ||
    pathname.startsWith('/jobs/tag/')
  ) {
    // Listing pages: 1 hour cache + 10 min SWR
    res.headers.set(
      'Cache-Control',
      'public, max-age=3600, stale-while-revalidate=600'
    )
  } else if (pathname.startsWith('/job/')) {
    // Job detail pages: 30 days cache + 24 hour SWR
    res.headers.set(
      'Cache-Control',
      'public, max-age=2592000, stale-while-revalidate=86400'
    )
  }

  // Append Accept-Encoding to existing Vary header (don't replace Next.js's RSC varies)
  const existingVary = res.headers.get('Vary')
  if (existingVary && !existingVary.includes('Accept-Encoding')) {
    res.headers.set('Vary', `${existingVary}, Accept-Encoding`)
  } else if (!existingVary) {
    res.headers.set('Vary', 'Accept-Encoding')
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/job/:path*',
    '/jobs/:path*',
    '/sitemap.xml',
    '/sitemap.txt',
    '/robots.txt',
    '/feed.xml',
    '/feed/:path*',
  ],
}

