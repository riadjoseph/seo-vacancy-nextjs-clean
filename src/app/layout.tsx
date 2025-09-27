import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from '@/lib/providers';
import { Navigation, Footer } from '@/components/Navigation';
import { Analytics } from '@/lib/analytics';
import { Toaster } from 'sonner';
import { BuyMeACoffeeWidget } from '@/components/BuyMeACoffee';
import ServerBotTracker from '@/components/ServerBotTracker';
import { Suspense } from 'react';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServerBotTracker />
        <Providers>
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
