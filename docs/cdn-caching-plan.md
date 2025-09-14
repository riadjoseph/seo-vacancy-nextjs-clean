# Netlify CDN Caching Plan

This document outlines the current state and proposed changes to cache SSR pages behind Netlify’s CDN for fewer function invocations and fewer Supabase queries, while keeping data acceptably fresh for users and bots.

## Goals
- Use Netlify CDN to cache SSR HTML for 24h on home, city, and tag pages; longer on job detail pages.
- Keep browser cache conservative (always revalidate) while letting CDN serve cached.
- Avoid “durable” for HTML pages so a redeploy clears cache. Use “durable” only for feeds if desired.
- Maintain existing behavior: job detail pages stay live even after expiry; lists exclude expired jobs.

## Current State (as of this checkpoint)
- Global headers (netlify.toml):
  - `Cache-Control: public, max-age=0, must-revalidate`
  - `Netlify-CDN-Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`
  - These apply to static assets/responses, not Next SSR responses.
- SSR pages currently respond with Next’s default for dynamic output:
  - `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`
  - Result: CDN does not cache these pages; origin/function is hit frequently; more Supabase queries.
- RSS and Sitemap routes explicitly set Netlify CDN headers already (good).

## Proposed Change
Add a lightweight Next middleware to set CDN caching headers for SSR HTML responses. This is required because netlify.toml headers do not apply to SSR function responses.

### Policy by Route
- `/` (home), `/jobs/city/:city`, `/jobs/tag/:tag`:
  - `Netlify-CDN-Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`
  - `Cache-Control: public, max-age=0, must-revalidate`
- `/job/:slug` (job detail):
  - `Netlify-CDN-Cache-Control: public, s-maxage=604800, stale-while-revalidate=2592000`
  - `Cache-Control: public, max-age=0, must-revalidate`
- Skip `/api`, `/_next`, assets, and other non-HTML requests.

### Notes
- Browsers will usually get a 200 from the CDN cache (not a 304 from origin). This is expected and reduces origin load.
- Keep “durable” off for HTML pages so a redeploy clears cache. Feeds can use `durable` if long-lived cache is desired.
- Keep `Netlify-Vary: query` from netlify.toml. It’s fine for SSR too; middleware will not override it.

## Middleware Sketch (to be added next)
Example outline of `middleware.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip APIs and static assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map|txt|xml|json|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next()

  // Base browser policy: revalidate at browser, cache at CDN
  res.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')

  // Route-specific CDN TTLs
  if (pathname === '/' || pathname.startsWith('/jobs/city/') || pathname.startsWith('/jobs/tag/')) {
    res.headers.set('Netlify-CDN-Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
  } else if (pathname.startsWith('/job/')) {
    res.headers.set('Netlify-CDN-Cache-Control', 'public, s-maxage=604800, stale-while-revalidate=2592000')
  }

  return res
}

export const config = {
  matcher: [
    '/',
    '/job/:path*',
    '/jobs/:path*',
    // Let everything else pass by default
  ],
}
```

## Rollout Plan
1. Add middleware with the route TTLs above.
2. Deploy to Netlify.
3. Validate headers on key pages with `curl -I -H "Accept: text/html" <url>`:
   - Ensure `Netlify-CDN-Cache-Control` present on `/`, `/jobs/city/...`, `/jobs/tag/...`, `/job/...`.
   - Confirm `Cache-Control: public, max-age=0, must-revalidate` present.
4. Hit pages twice and verify `cache-status` shows edge hits after warm-up.
5. Monitor Supabase request counts and Netlify function invocations.

## Rollback Plan
- A Git tag has been created before adding middleware: `checkpoint-before-cdn-cache-middleware`.
- To roll back:
  1) `git checkout checkpoint-before-cdn-cache-middleware`
  2) Deploy the previous commit on Netlify.
- Alternatively, remove `middleware.ts` and redeploy.

## Validation Checklist
- Home `/`: Netlify-CDN-Cache-Control present, edge hit after warm-up.
- City `/jobs/city/amsterdam`: same as above.
- Tag `/jobs/tag/technical-seo`: same as above.
- Job detail `/job/some-slug`: longer TTL header present.
- RSS `/feed.xml` and Sitemap `/sitemap.xml`: existing headers still present.

## Future Enhancements
- Configure `next.config.ts` `images.remotePatterns` for logo/CDN hosts and remove `unoptimized` from `<Image />` components to enable Next image optimization.
- Consider moving tag-page expiry filtering to the query (currently mixed in memory) for consistency.
- If public pages stop reading cookies (from Supabase SSR client), consider Next ISR (`export const revalidate = 86400`) to eliminate many SSR invocations entirely.

## FAQ
**Why not rely on 304s from origin?**
Because the CDN can serve 200 from cache faster and with fewer origin hits; 304s are less useful when a CDN is in front.

**Will durable caches block redeploy flushes?**
Yes. That’s why we avoid `durable` on HTML pages we plan to flush via redeploys. Keep `durable` limited to feeds if needed.

