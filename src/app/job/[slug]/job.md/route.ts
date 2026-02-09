import { createPublicClient } from '@/lib/supabase/public'
import type { Tables } from '@/lib/supabase/types'

type Job = Tables<'jobs'>

async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = createPublicClient()
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !job) return null
  return job
}

function buildMarkdown(job: Job, baseUrl: string): string {
  const lines: string[] = []

  // Title
  lines.push(`# ${job.title}`)
  lines.push('')

  // Meta table
  lines.push('| Field | Value |')
  lines.push('|-------|-------|')
  lines.push(`| **Company** | ${job.company_name} |`)
  if (job.city) lines.push(`| **Location** | ${job.city} |`)
  if (job.category && job.category !== 'FULL_TIME') lines.push(`| **Category** | ${job.category} |`)
  if (job.created_at) lines.push(`| **Posted** | ${new Date(job.created_at).toISOString().split('T')[0]} |`)
  if (job.expires_at) lines.push(`| **Expires** | ${new Date(job.expires_at).toISOString().split('T')[0]} |`)
  if (job.hide_salary !== true && (job.salary_min !== null || job.salary_max !== null)) {
    const currency = job.salary_currency || ''
    const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n)
    let salary = ''
    if (job.salary_min != null && job.salary_max != null) salary = `${currency}${fmt(job.salary_min)} – ${currency}${fmt(job.salary_max)}`
    else if (job.salary_min != null) salary = `From ${currency}${fmt(job.salary_min)}`
    else if (job.salary_max != null) salary = `Up to ${currency}${fmt(job.salary_max)}`
    if (salary) lines.push(`| **Salary** | ${salary} |`)
  }
  lines.push('')

  // Tags
  if (job.tags && job.tags.length > 0) {
    lines.push('## Skills & Tags')
    lines.push(job.tags.map(t => `\`${t}\``).join(', '))
    lines.push('')
  }

  // Teaser
  if (job.teaser && job.teaser.trim()) {
    lines.push('## What Makes This Opportunity Special')
    lines.push(job.teaser.trim())
    lines.push('')
  }

  // Description
  if (job.description && job.description.trim()) {
    lines.push('## Job Description')
    lines.push(job.description.trim())
    lines.push('')
  }

  // Company info
  if (job.company_info && job.company_info.trim()) {
    lines.push(`## About ${job.company_name}`)
    lines.push(job.company_info.trim())
    lines.push('')
  }

  // FAQ
  if (job.faq && job.faq.trim()) {
    lines.push('## Frequently Asked Questions')
    lines.push(job.faq.trim())
    lines.push('')
  }

  // Apply link
  if (job.job_url) {
    lines.push('## Apply')
    lines.push(`[Apply for this position](${job.job_url})`)
    lines.push('')
  }

  // Source link
  lines.push('---')
  lines.push(`Source: [${job.title} at ${job.company_name}](${baseUrl}/job/${job.slug})`)
  lines.push('')

  return lines.join('\n')
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const job = await getJobBySlug(slug)

  if (!job) {
    return new Response('# Job Not Found\n\nThis job posting does not exist or has been removed.\n', {
      status: 404,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    })
  }

  // Skip expired jobs
  if (job.expires_at && new Date(job.expires_at) < new Date()) {
    return new Response('# Job Expired\n\nThis job posting has expired and is no longer accepting applications.\n', {
      status: 404,
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    })
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'https://seo-vacancy.eu'
  const markdown = buildMarkdown(job, baseUrl)

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=86400',
    },
  })
}
