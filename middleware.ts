import { NextRequest, NextResponse } from 'next/server'

// Apply CDN caching headers for SSR HTML responses on Netlify.
// netlify.toml headers do not affect SSR responses, so we set them here.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip APIs, Next internals, and static assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    /\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map|txt|xml|json|woff2?)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  // Keep browsers revalidating; let CDN cache via Netlify header.
  res.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')

  // Route-specific CDN TTLs
  if (
    pathname === '/' ||
    pathname.startsWith('/jobs/city/') ||
    pathname.startsWith('/jobs/tag/')
  ) {
    res.headers.set(
      'Netlify-CDN-Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=604800'
    )
  } else if (pathname.startsWith('/job/')) {
    res.headers.set(
      'Netlify-CDN-Cache-Control',
      'public, s-maxage=604800, stale-while-revalidate=2592000'
    )
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/job/:path*',
    '/jobs/:path*',
  ],
}

