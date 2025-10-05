import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

import { createJobSlug } from '@/utils/jobUtils'
import { createTagSlug } from '@/utils/tagUtils'

type JobRecord = {
  slug?: string | null
  title?: string | null
  company_name?: string | null
  city?: string | null
  tags?: string[] | null
}

type SupabaseWebhookPayload = {
  type: string
  record?: JobRecord | null
  old_record?: JobRecord | null
}

const SUPPORTED_EVENTS = new Set(['INSERT', 'UPDATE', 'DELETE'])

export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret')
    const expectedSecret = process.env.REVALIDATION_SECRET

    if (!expectedSecret) {
      return NextResponse.json(
        { message: 'REVALIDATION_SECRET is not configured' },
        { status: 500 }
      )
    }

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { message: 'Invalid secret token' },
        { status: 401 }
      )
    }

    const payload = (await request.json()) as SupabaseWebhookPayload

    if (!SUPPORTED_EVENTS.has(payload.type)) {
      return NextResponse.json(
        { message: `Unsupported event type: ${payload.type}` },
        { status: 400 }
      )
    }

    const paths = collectPaths(payload)

    await Promise.all(
      Array.from(paths).map(async (path) => {
        try {
          await revalidatePath(path)
        } catch (error) {
          console.error(`Failed to revalidate ${path}:`, error)
        }
      })
    )

    return NextResponse.json({
      revalidated: true,
      event: payload.type,
      paths: Array.from(paths),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { message: 'Error revalidating', error: String(error) },
      { status: 500 }
    )
  }
}

function collectPaths(payload: SupabaseWebhookPayload): Set<string> {
  const paths = new Set<string>()
  const cities = new Set<string>()
  const tags = new Set<string>()
  const jobSlugs = new Set<string>()

  const current = payload.record || null
  const previous = payload.old_record || null

  const candidates: (JobRecord | null)[] = [current, previous]

  candidates.forEach((record) => {
    if (!record) return

    const slug = resolveJobSlug(record)
    if (slug) {
      jobSlugs.add(slug)
    }

    if (record.city) {
      cities.add(record.city)
    }

    if (Array.isArray(record.tags)) {
      record.tags.forEach((tag) => {
        if (typeof tag === 'string' && tag.trim()) {
          tags.add(tag)
        }
      })
    }
  })

  jobSlugs.forEach((slug) => {
    paths.add(`/job/${slug}`)
  })

  cities.forEach((city) => {
    const cityPath = encodeURIComponent(city.toLowerCase())
    paths.add(`/jobs/city/${cityPath}`)
    paths.add(`/feed/city/${cityPath}`)
  })

  tags.forEach((tag) => {
    const tagSlug = createTagSlug(tag)
    paths.add(`/jobs/tag/${tagSlug}`)
  })

  // Global listings & surface areas
  paths.add('/')
  paths.add('/feed.xml')
  paths.add('/sitemap.xml')
  paths.add('/sitemap.txt')
  paths.add('/robots.txt')

  return paths
}

function resolveJobSlug(record: JobRecord): string | null {
  if (record.slug && record.slug.trim()) {
    return record.slug.trim()
  }

  if (!record.title || !record.company_name) {
    return null
  }

  return createJobSlug(record.title, record.company_name, record.city ?? 'remote')
}
