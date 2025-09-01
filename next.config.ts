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
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          }
        ],
      },
    ]
  },
};

export default nextConfig;
