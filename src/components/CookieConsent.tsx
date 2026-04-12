'use client'

import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'
import posthog from 'posthog-js'

const GA_MEASUREMENT_ID = 'G-4S7FY23V18'

function grantAnalytics() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    })
  }
}

function denyAnalytics() {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
    })
  }
}

function initPostHog(withPersistence: boolean) {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    defaults: '2026-01-30',
    capture_pageview: false,
    capture_pageleave: true,
    persistence: withPersistence ? 'localStorage+cookie' : 'memory',
  })
}

export default function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      // Store consent in a first-party cookie (exempt as strictly necessary)
      cookie: {
        name: 'cc_cookie',
        expiresAfterDays: 365,
        sameSite: 'Lax',
      },

      // Auto-clear GA cookies when analytics is rejected
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: false,
          autoClear: {
            cookies: [
              { name: /^_ga/ },
              { name: '_gid' },
              { name: /^_gat/ },
            ],
          },
        },
      },

      onConsent: () => {
        const analyticsAccepted = CookieConsent.acceptedCategory('analytics')
        if (analyticsAccepted) {
          grantAnalytics()
          // Re-init GA with full tracking now that consent is granted
          if (window.gtag) {
            window.gtag('config', GA_MEASUREMENT_ID, {
              page_location: window.location.href,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
            })
          }
          initPostHog(true)
        } else {
          denyAnalytics()
          initPostHog(false)
        }
      },

      onChange: ({ changedCategories }) => {
        if (changedCategories.includes('analytics')) {
          const analyticsAccepted = CookieConsent.acceptedCategory('analytics')
          if (analyticsAccepted) {
            grantAnalytics()
            initPostHog(true)
          } else {
            denyAnalytics()
            posthog.opt_out_capturing()
            initPostHog(false)
          }
        }
      },

      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'We use cookies',
              description:
                'We use analytics cookies to understand how visitors use this site, so we can improve it. You can accept or decline — if you decline, we still collect anonymous, aggregated data.',
              acceptAllBtn: 'Accept analytics',
              acceptNecessaryBtn: 'Decline',
              showPreferencesBtn: 'Manage preferences',
              footer:
                '<a href="/privacy-policy">Privacy Policy</a>',
            },
            preferencesModal: {
              title: 'Cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Save preferences',
              closeIconLabel: 'Close',
              sections: [
                {
                  title: 'Strictly necessary',
                  description:
                    'These cookies are required for the site to function (e.g. authentication, consent storage). They cannot be disabled.',
                  linkedCategory: 'necessary',
                },
                {
                  title: 'Analytics',
                  description:
                    'Google Analytics (GA4) and PostHog help us understand which pages are visited and how the site performs. No advertising or cross-site tracking.',
                  linkedCategory: 'analytics',
                  cookieTable: {
                    headers: { name: 'Cookie', domain: 'Domain', desc: 'Description' },
                    body: [
                      { name: '_ga', domain: '.seo-vacancy.eu', desc: 'GA4 client identifier (2 years)' },
                      { name: '_ga_*', domain: '.seo-vacancy.eu', desc: 'GA4 session state (2 years)' },
                      { name: '_gid', domain: '.seo-vacancy.eu', desc: 'GA4 session identifier (24 hours)' },
                    ],
                  },
                },
              ],
            },
          },
        },
      },

      // Match the site's dark/amber theme
      guiOptions: {
        consentModal: {
          layout: 'bar',
          position: 'bottom',
          equalWeightButtons: false,
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
    })
  }, [])

  return null
}
