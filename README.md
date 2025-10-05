# SEO Vacancy - Job Board

This is a [Next.js](https://nextjs.org) project for a European SEO job board, optimized for performance and SEO.

## Documentation

- **[Caching & ISR Architecture](CACHING_ARCHITECTURE.md)** - Comprehensive guide to our caching strategy, ISR webhooks, and performance optimization

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Base URL
NEXTAUTH_URL=http://localhost:3000

# ISR Revalidation (generate with: openssl rand -hex 32)
REVALIDATION_SECRET=your-secret-key
```

## Key Features

- **Hybrid Caching Strategy** - 30-day cache on job pages with instant webhook updates
- **Public Supabase Client** - Cookie-free data fetching for maximum cacheability
- **ISR Webhooks** - Automatic page revalidation when jobs change
- **City-Specific RSS Feeds** - Dynamic feeds for cities with 3+ jobs
- **SEO Optimized** - Proper cache headers, canonical URLs, structured data

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Netlify

This project is configured for deployment on Netlify with:
- ISR support via Next.js adapter
- Webhook integration with Supabase
- Environment variable configuration

See [CACHING_ARCHITECTURE.md](CACHING_ARCHITECTURE.md) for deployment checklist.
