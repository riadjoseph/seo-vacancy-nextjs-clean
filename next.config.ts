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
};

export default nextConfig;
