'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import Script from 'next/script'

// Google Analytics types
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

// Google Analytics GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-4S7FY23V18'

// Initialize Google Analytics — respects Consent Mode v2 defaults set in layout.tsx
const initGA = (measurementId: string) => {
  if (typeof window !== 'undefined' && !window.gtag) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function(...args: unknown[]) {
      window.dataLayer.push(args)
    }
    window.gtag('js', new Date())

    // GA4 config — no ad signals, no cross-site tracking.
    // Cookie storage is controlled by Consent Mode v2 (set in layout.tsx before this script loads).
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
  }
}

// Track page views with Google Analytics
const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_location: url,
    })
  }
}

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initGA(GA_MEASUREMENT_ID)
  }, [])

  useEffect(() => {
    if (pathname) {
      let url = window.location.origin + pathname
      if (searchParams && searchParams.toString()) {
        url += `?${searchParams.toString()}`
      }
      trackPageView(url)
    }
  }, [pathname, searchParams])

  return (
    <>
      {/* Google Analytics Script — consent default is set in layout.tsx before this loads */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
        `}
      </Script>
    </>
  )
}

// Export utility functions for custom events
export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  // Track with PostHog (via provider — already initialized)
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.capture(eventName, properties)
  }

  // Track with Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, { ...properties })
  }
}

export const identifyUser = (userId: string, properties?: Record<string, unknown>) => {
  // PostHog identification
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.identify(userId, properties)
  }

  // Google Analytics user properties (cookieless)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: userId,
      custom_map: properties,
      client_storage: 'none'
    })
  }
}
