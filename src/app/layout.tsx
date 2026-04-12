import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/lib/providers';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Toaster } from 'sonner';
import { LazyAnalytics, LazyBuyMeACoffee, LazyCookieConsent } from '@/components/ClientWidgets';
import { Analytics } from "@vercel/analytics/next";
import { PostHogProvider } from './posthog-provider';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://seo-vacancy.eu'),
  title: "Search + Answer Engine Optimization Jobs in Europe - WakeUpHappy :)",
  description: "Find the best SEO, GEO, AI and Search Data jobs in Europe. Wake up to a job you like! - Emloyers: Post your AI and SEO job openings here first.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    shortcut: ['/favicon.ico'],
    apple: ['/icon.svg'],
    other: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        sizes: '16x16 32x32',
        url: '/favicon.ico',
      },
    ],
  },
  manifest: '/manifest.webmanifest',
  other: {
    'msapplication-TileColor': '#f59e0b',
    'theme-color': '#f59e0b',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        {/* Consent Mode v2 — must run before the GA script loads */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              wait_for_update: 2000
            });
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <PostHogProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
            {/* Lazy load analytics to avoid blocking initial render */}
            <LazyAnalytics />
            <Analytics />
            {/* Viewport pixel probes — invisible 1x1 GIFs for bot render detection */}
            <picture>
              <source media="(max-width:768px)" srcSet="/img/t/m.gif" width={1} height={1} />
              <source media="(min-width:769px)" srcSet="/img/t/d.gif" width={1} height={1} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/t/d.gif" width={1} height={1} alt="" style={{position:'absolute',opacity:0,pointerEvents:'none'}} />
            </picture>
            {/* Cookie consent banner */}
            <LazyCookieConsent />
            {/* Defer non-critical widgets */}
            <LazyBuyMeACoffee />
          </PostHogProvider>
        </Providers>
      </body>
    </html>
  );
}
