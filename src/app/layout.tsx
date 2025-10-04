import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/lib/providers';
import { Navigation, Footer } from '@/components/Navigation';
import { Toaster } from 'sonner';
import { LazyAnalytics, LazyTrackerPixel, LazyBuyMeACoffee } from '@/components/ClientWidgets';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://seo-vacancy.eu'),
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

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
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
          {/* Defer non-critical widgets */}
          <LazyTrackerPixel />
          <LazyBuyMeACoffee />
        </Providers>
      </body>
    </html>
  );
}
