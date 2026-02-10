import { NextRequest, NextResponse } from 'next/server'

// Lightweight bot detection regex — covers major bots without being exhaustive.
// Full classification (name, vendor, priority) happens server-side in log.php.
const BOT_UA_REGEX =
  /bot\b|crawler|spider|crawl|slurp|googlebot|bingbot|yandex|baidu|duckduck|applebot|facebookexternalhit|linkedinbot|twitterbot|discordbot|telegrambot|whatsapp|gptbot|oai-searchbot|chatgpt|claudebot|anthropic|perplexitybot|ccbot|diffbot|bytespider|ahrefsbot|semrushbot|mj12bot|dotbot|screaming.frog|blexbot|rogerbot|sistrix|dataforseo|seobility|serpstatbot|contentking|uptimerobot|pingdom|gtmetrix|pagespeed|lighthouse|feedly|feedfetcher|slackbot|curl\b|wget\b|python-requests|headlesschrome|phantomjs|selenium|puppeteer|deepseekbot|meta-external/i

const BOT_LOG_URL = process.env.BOT_LOG_URL || ''
const BOT_LOG_KEY = process.env.BOT_LOG_KEY || ''

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

  // --- Bot logging (fire-and-forget) ---
  const ua = req.headers.get('user-agent') || ''
  if (BOT_LOG_URL && BOT_UA_REGEX.test(ua)) {
    const payload = {
      user_agent: ua,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '',
      pathname,
      host: req.headers.get('host') || '',
      referer: req.headers.get('referer') || '',
      country: req.headers.get('x-vercel-ip-country') || '',
      method: req.method,
      timestamp: new Date().toISOString(),
    }

    // Fire-and-forget: do NOT await — response is not blocked
    fetch(BOT_LOG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Log-Key': BOT_LOG_KEY,
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silently ignore logging failures — never block the response
    })
  }

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
    // Catch all page routes; exclude api, _next, favicon, and static assets
    '/((?!api|_next|favicon).*)',
  ],
}
