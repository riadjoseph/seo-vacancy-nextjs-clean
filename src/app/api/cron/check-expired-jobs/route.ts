import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'
import { submitToGoogleIndexing } from '@/lib/indexing/google'
import { submitToIndexNow } from '@/lib/indexing/indexnow'
import { buildJobUrl, getBaseUrl } from '@/lib/indexing/urls'

export async function GET(request: NextRequest) {
  // Verify Vercel cron authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createPublicClient()
  const now = new Date().toISOString()

  // Find expired jobs that haven't been notified yet
  // This approach handles cron failures gracefully
  const { data: expiredJobs, error } = await supabase
    .from('jobs')
    .select('id, slug')
    .lt('expires_at', now)
    .eq('removal_notified', false)
    .limit(100) // Process in chunks to avoid timeout

  if (error) {
    console.error('Failed to fetch expired jobs:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!expiredJobs?.length) {
    return NextResponse.json({ message: 'No expired jobs to process', processed: 0 })
  }

  const jobsWithSlugs = expiredJobs.filter(job => job.slug)
  const urls = jobsWithSlugs.map(job => buildJobUrl(job.slug!))

  // Submit removal notifications (non-blocking)
  const results = await Promise.allSettled([
    submitToGoogleIndexing(urls, 'URL_DELETED'),
    submitToIndexNow(urls, {
      key: process.env.INDEXNOW_KEY || '',
      host: new URL(getBaseUrl()).hostname
    })
  ])

  // Mark jobs as notified (even if submission failed - we tried)
  const jobIds = jobsWithSlugs.map(job => job.id)
  await supabase
    .from('jobs')
    .update({ removal_notified: true })
    .in('id', jobIds)

  console.log('Expired jobs processed:', {
    count: urls.length,
    urls,
    googleResult: results[0].status,
    indexnowResult: results[1].status
  })

  return NextResponse.json({
    processed: urls.length,
    urls,
    totalExpired: expiredJobs.length
  })
}
