'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface BotTrackerProps {
  trackerUrl?: string
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string
    type?: string
  }
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

interface NavigatorWithWebdriver {
  webdriver?: boolean
}

interface DocumentWithWebkit {
  webkitVisibilityState?: string
}

export default function BotTracker({
  trackerUrl = 'https://wiki.booksparis.com/enhanced-tracker.php'
}: BotTrackerProps) {
  const pathname = usePathname()

  useEffect(() => {
    const trackPageView = () => {
      try {
        // Get comprehensive page info
        const pageUrl = window.location.href
        const pageTitle = document.title
        const screenRes = `${window.screen.width}x${window.screen.height}`
        const language = navigator.language
        const userAgent = navigator.userAgent

        // 🚀 ULTIMATE Enhanced bot detection with 100+ patterns
        const userAgentLower = userAgent.toLowerCase()
        const botPatterns = [
          // 🔥 AI/LLM Bots (CRITICAL - These are the golden ones!)
          'gptbot', 'oai-searchbot', 'chatgpt-user', 'chatgpt', 'claudebot',
          'anthropic-ai', 'claude-web', 'perplexitybot', 'perplexity-user',
          'mistralai-user', 'cohere-ai', 'google-extended', 'ccbot', 'diffbot',
          'youbot', 'duckassistbot', 'ai2bot', 'semanticscholarbot', 'img2dataset',
          'chatglm spider', 'deepseekbot', 'owlin bot', 'sider.ai bot',

          // 🔍 Major Search Engines
          'googlebot', 'google', 'bingbot', 'bing', 'applebot', 'applebot-extended',
          'duckduckbot', 'yandexbot', 'yandex', 'baiduspider', 'baidu', 'slurp',
          'naverbot', 'naver', 'qwantify', 'mojeekbot', 'startpage',

          // 🛒 E-commerce & Price Bots
          'amazonbot', 'dataprovider', 'pricedronebot', 'prieco', 'mergadobot',
          'tineye', 'google-shopping', 'shopbot',

          // 📱 Social Media Bots
          'facebookexternalhit', 'meta-external', 'meta-externalfetcher',
          'linkedinbot', 'twitterbot', 'pinterestbot', 'discordbot', 'telegrambot',
          'whatsapp', 'bytespider', 'kakao', 'line-poker', 'snapbot', 'skype',

          // 🎯 SEO & Analytics Bots
          'ahrefsbot', 'semrushbot', 'mj12bot', 'screaming frog', 'blexbot',
          'dotbot', 'rogerbot', 'seozoom', 'sistrix', 'ryte', 'contentking',
          'botify', 'dataforseo', 'serpstatbot', 'seobility', 'senutobot',
          'brightedge', 'conductor', 'searchmetrics', 'spyfu',

          // 🔒 Security & Monitoring Bots
          'uptimerobot', 'pingdom', 'gtmetrix', 'netcraft', 'censys', 'shodan',
          'leakix', 'securityheaders', 'ssl labs', 'qualys', 'rapid7',

          // 📰 Content & RSS Bots
          'feedly', 'flipboard', 'pocket', 'inoreader', 'feedburner', 'rssbot',
          'newsblur', 'blogtrottr', 'feedfetcher-google',

          // 🎓 Academic & Research Bots
          'archive.org', 'heritrix', 'wayback', 'turnitinbot', 'researchgate',
          'mendeley', 'zotero', 'citeulike',

          // 💰 Advertising & Marketing Bots
          'adsbot', 'adsbot-google', 'mediapartners-google', 'brandverity',
          'adnxs', 'doubleclick', 'googlesyndication',

          // ☁️ Cloud & CDN Bots
          'cloudflare', 'keycdn', 'fastly', 'maxcdn', 'amazonaws',

          // 🧪 Testing & Headless Browsers
          'headlesschrome', 'headless chrome', 'phantomjs', 'selenium',
          'puppeteer', 'playwright', 'webdriver', 'chromedriver',
          'chrome-lighthouse', 'pagespeed insights',

          // 🔧 Development & API Tools
          'postman', 'insomnia', 'curl', 'wget', 'httpie', 'axios', 'requests',

          // 🆘 Generic Bot Patterns (catch-all)
          'bot', 'crawler', 'spider', 'scraper', 'fetch', 'crawl',
          'indexer', 'scanner', 'checker', 'monitor', 'validator',
          'archiver', 'analyzer', 'parser', 'extractor', 'harvester'
        ]

        const isBot = botPatterns.some(pattern => userAgentLower.includes(pattern))

        // Get performance metrics
        let responseTime = 'unknown'
        let pageSize = 'unknown'
        let connectionType = 'unknown'
        let deviceMemory = 'unknown'
        let hardwareConcurrency = 'unknown'

        // Performance timing
        if ('performance' in window && window.performance.timing) {
          const timing = window.performance.timing
          responseTime = (timing.loadEventEnd - timing.navigationStart).toString()
        }

        // Network information
        if ('connection' in navigator) {
          const connection = (navigator as NavigatorWithConnection).connection
          connectionType = connection?.effectiveType || connection?.type || 'unknown'
        }

        // Device capabilities
        if ('deviceMemory' in navigator) {
          deviceMemory = (navigator as NavigatorWithMemory).deviceMemory?.toString() || 'unknown'
        }

        if ('hardwareConcurrency' in navigator) {
          hardwareConcurrency = navigator.hardwareConcurrency?.toString() || 'unknown'
        }

        // Estimate page size from resource entries
        if ('performance' in window && window.performance.getEntriesByType) {
          try {
            const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[]
            const totalSize = resources.reduce((total, resource) => {
              return total + (resource.transferSize || resource.decodedBodySize || 0)
            }, 0)
            pageSize = totalSize.toString()
          } catch {
            // Fallback - ignore error
          }
        }

        // Get additional context
        const referrer = document.referrer || 'direct'
        const timestamp = new Date().toISOString()

        // Detect if this is a prerendered page
        const isPrerendered = (document as DocumentWithWebkit).webkitVisibilityState === 'prerender' ||
                             (navigator as NavigatorWithWebdriver).webdriver === true

        // Get viewport info
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight
        const viewport = `${viewportWidth}x${viewportHeight}`

        // Color depth and pixel ratio
        const colorDepth = screen.colorDepth || 'unknown'
        const pixelRatio = window.devicePixelRatio || 1

        // Time zone
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'

        // Build comprehensive tracking URL with all parameters
        const params = new URLSearchParams({
          // Basic page info
          url: pageUrl,
          title: pageTitle,
          ref: referrer,

          // Screen & device info
          res: screenRes,
          viewport: viewport,
          color_depth: colorDepth.toString(),
          pixel_ratio: pixelRatio.toString(),

          // Performance metrics
          rt: responseTime,
          size: pageSize,

          // Network & device capabilities
          connection: connectionType,
          memory: deviceMemory,
          cores: hardwareConcurrency,

          // Localization
          lang: language,
          tz: timeZone,

          // Bot detection & status
          is_bot: isBot.toString(),
          prerendered: isPrerendered.toString(),
          status: '200',

          // Platform info
          netlify: 'true',
          platform: 'nextjs',

          // Timestamp
          ts: timestamp,

          // Additional tracking data
          pathname: pathname,
          ua: userAgent
        })

        // Create enhanced tracking pixel
        const img = new Image(1, 1)
        img.src = `${trackerUrl}?${params.toString()}`

        // Debug logging (remove in production)
        console.debug('🤖 Bot tracker:', {
          url: pageUrl,
          trackerUrl: `${trackerUrl}?${params.toString()}`,
          isBot,
          userAgent: navigator.userAgent
        })

        // Set up error handling
        img.onerror = () => {
          console.warn('Bot tracker: Failed to load tracking pixel')
        }

        img.onload = () => {
          console.debug('Bot tracker: Page view tracked successfully')
        }

        // Style the tracking pixel (invisible)
        img.style.position = 'absolute'
        img.style.width = '1px'
        img.style.height = '1px'
        img.style.opacity = '0'
        img.style.pointerEvents = 'none'
        img.style.left = '-9999px'
        img.style.top = '-9999px'

        // Add to DOM briefly for proper loading
        document.body.appendChild(img)

        // Clean up after successful load or timeout
        const cleanup = () => {
          if (img.parentNode) {
            img.parentNode.removeChild(img)
          }
        }

        // Remove after load or 5 second timeout
        img.addEventListener('load', cleanup)
        img.addEventListener('error', cleanup)
        setTimeout(cleanup, 5000)

      } catch (error) {
        console.warn('Bot tracker error:', error)
      }
    }

    // Track immediately when component mounts
    const immediateTimer = setTimeout(trackPageView, 100)

    // Also track after page is fully loaded to get accurate performance metrics
    const loadTimer = setTimeout(trackPageView, 2000)

    // Track when visibility changes (for prerendered pages)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(trackPageView, 500)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup function
    return () => {
      clearTimeout(immediateTimer)
      clearTimeout(loadTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pathname, trackerUrl])

  // Temporary debug indicator (remove in production)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'green',
          color: 'white',
          padding: '5px',
          fontSize: '12px',
          zIndex: 9999,
          borderRadius: '3px'
        }}
      >
        🤖 Bot Tracker Active
      </div>
    )
  }

  return null // This component renders nothing visible in production
}