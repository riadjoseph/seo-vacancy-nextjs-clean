import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/tag/:slug*',
        destination: '/jobs/tag/:slug*',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        // Cache static assets (images, fonts, etc.) for 1 year
        source: '/(.*)\\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|otf)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache CSS and JS chunks for 1 year (Next.js includes hash in filename)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache API routes for shorter duration (5 minutes)
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
      {
        // Cache sitemap and robots for 1 day
        source: '/(sitemap\\.xml|robots\\.txt|sitemap\\.txt|feed\\.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
