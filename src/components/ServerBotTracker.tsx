interface ServerBotTrackerProps {
  page?: string
  title?: string
}

export default function ServerBotTracker({ page, title }: ServerBotTrackerProps) {
  // Build basic tracking parameters for static generation
  const params = new URLSearchParams({
    url: page || 'https://seo-vacancy.eu',
    title: title || 'SEO Vacancy',
    ref: 'direct',
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
    pathname: page ? new URL(page).pathname : '/',
    ua: 'server-side-render',
    ts: new Date().toISOString()
  })

  const trackingUrl = `https://wiki.booksparis.com/enhanced-tracker.php?${params.toString()}`

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