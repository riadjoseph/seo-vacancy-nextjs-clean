'use client'

import dynamic from 'next/dynamic'

// Lazy load non-critical components on client-side only
export const LazyAnalytics = dynamic(
  () => import('@/lib/analytics').then(mod => ({ default: mod.Analytics })),
  { ssr: false }
)

export const LazyBuyMeACoffee = dynamic(
  () => import('@/components/BuyMeACoffee').then(mod => ({
    default: () => mod.BuyMeACoffeeWidget({
      description: "Support WakeUpHappy - Keep it ad-free!",
      message: "",
      color: "#5F7FFF"
    })
  })),
  { ssr: false }
)
