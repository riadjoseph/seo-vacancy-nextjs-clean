/* eslint-disable @next/next/no-img-element */

interface ServerBotTrackerProps {
  page?: string
  title?: string
  userAgent?: string
  pathname?: string
  referer?: string
  trackerUrl?: string
}

function resolvePathname(page?: string, pathname?: string) {
  if (pathname && pathname.trim() !== '') {
    return pathname
  }

  if (!page) {
    return '/'
  }

  try {
    return new URL(page).pathname || '/'
  } catch {
    return page.startsWith('/') ? page : '/'
  }
}

const trackerEndpoint = process.env.NEXT_PUBLIC_TRACKER_URL || 'https://wiki.booksparis.com/enhanced-tracker.php'

export default function ServerBotTracker({
  page,
  title,
  userAgent,
  pathname,
  referer,
  trackerUrl
}: ServerBotTrackerProps) {
  const resolvedPathname = resolvePathname(page, pathname)

  const params = new URLSearchParams({
    url: page || 'https://seo-vacancy.eu',
    title: title || 'SEO Vacancy',
    ref: referer || 'direct',
    res: '1920x1080',
    rt: '0',
    size: '0',
    connection: 'unknown',
    memory: 'unknown',
    cores: 'unknown',
    lang: 'en-US',
    tz: 'UTC',
    is_bot: 'false',
    prerendered: 'true',
    status: '200',
    netlify: 'true',
    platform: 'nextjs-ssr',
    pathname: resolvedPathname,
    ua: userAgent || 'server-side-render',
    ts: new Date().toISOString()
  })

  const trackingUrl = `${trackerUrl || trackerEndpoint}?${params.toString()}`

  return (
    <img
      alt=""
      aria-hidden="true"
      loading="lazy"
      width="1"
      height="1"
      decoding="async"
      data-nimg="1"
      src={trackingUrl}
      style={{
        color: 'transparent',
        position: 'absolute',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        left: '-9999px',
        top: '-9999px'
      }}
    />
  )
}
