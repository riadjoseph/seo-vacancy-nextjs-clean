import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/lib/providers';
import { Navigation, Footer } from '@/components/Navigation';
import { Analytics } from '@/lib/analytics';
import { Toaster } from 'sonner';
import { BuyMeACoffeeWidget } from '@/components/BuyMeACoffee';
import ServerBotTracker from '@/components/ServerBotTracker';
import BotTracker from '@/components/BotTracker';
import { Suspense } from 'react';
import { headers } from 'next/headers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wake Up Happy - Find Your Next SEO & Tech Career",
  description: "Wake up to new opportunities! Discover the latest SEO, marketing, and tech job opportunities across Europe",
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
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || undefined;
  const forwardedProto = headersList.get('x-forwarded-proto');
  const protocol = forwardedProto || (process.env.NODE_ENV === 'development' ? 'http' : 'https');
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || undefined;
  const invokePath =
    headersList.get('x-invoke-path') ||
    headersList.get('x-forwarded-uri') ||
    headersList.get('x-original-uri') ||
    headersList.get('x-rewrite-path') ||
    headersList.get('x-matched-path') ||
    '/';
  const invokeQuery = headersList.get('x-invoke-query');
  const pathname = invokeQuery ? `${invokePath}?${invokeQuery}` : invokePath;
  const referer = headersList.get('referer') || undefined;
  const pageUrl = host ? `${protocol}://${host}${pathname}` : undefined;
  const defaultTitle = typeof metadata.title === 'string' ? metadata.title : 'SEO Vacancy';

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServerBotTracker
          userAgent={userAgent}
          page={pageUrl}
          title={defaultTitle}
          pathname={pathname}
          referer={referer}
        />
        <Providers>
          <BotTracker />
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Suspense>
            <Analytics />
          </Suspense>
          <Toaster />
          <BuyMeACoffeeWidget
            description="Support WakeUpHappy - Keep it ad-free!"
            message=""
            color="#5F7FFF"
          />
        </Providers>
      </body>
    </html>
  );
}
