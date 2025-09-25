import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Breadcrumbs, generateBreadcrumbSchema, type BreadcrumbItem } from '@/components/ui/breadcrumbs'
import { RelatedJobs } from '@/components/RelatedJobs'
import { ExpandableJobDescription } from '@/components/ExpandableJobDescription'
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  ExternalLink, 
  Building2
} from 'lucide-react'
import { createTagSlug } from '@/utils/tagUtils'
import type { Tables } from '@/lib/supabase/types'


type Job = Tables<'jobs'>

interface JobPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams?: Promise<{
    cache?: string
  }>
}


async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !job) {
    return null
  }

  return job
}

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const { slug } = await params
  const job = await getJobBySlug(slug)
  
  if (!job) {
    return {
      title: 'Job Not Found - Permanently Removed',
      description: 'The job you are looking for has been permanently removed and is no longer available.'
    }
  }
  
  // Title: {job title} in {city} at {company name}
  const cityPart = job.city ? ` in ${job.city}` : ''
  const seoTitle = `${job.title}${cityPart} at ${job.company_name}`
  
  // Meta Description: {tag specializations} skills required at {company name} for an SEO Job in {city} -> Apply now: {job title}.
  const skillsText = job.tags && job.tags.length > 0 ? `${job.tags.join(', ')} skills` : 'SEO skills'
  const cityText = job.city ? ` in ${job.city}` : ''
  const metaDescription = `${skillsText} required at ${job.company_name} for an SEO Job${cityText} -> Apply now: ${job.title}.`
  
  return {
    title: seoTitle,
    description: metaDescription,
    openGraph: {
      title: seoTitle,
      description: metaDescription,
      type: 'article',
      publishedTime: job.created_at || undefined,
    },
  }
}

export default async function JobPage({ params, searchParams }: JobPageProps) {
  const { slug } = await params
  const searchParamsResolved = searchParams ? await searchParams : {}
  
  // Check for cache purge parameter
  if (searchParamsResolved.cache === 'purge') {
    // Redirect to cache purge API with redirect URL
    const { redirect } = await import('next/navigation')
    redirect(`/api/cache-purge/job/${slug}?redirect=${encodeURIComponent(`/job/${slug}`)}`)
  }
  
  const job = await getJobBySlug(slug)
  
  if (!job) {
    notFound()
  }
  
  // Check if job is expired - keep serving content but show as closed
  const isExpired = job.expires_at && new Date(job.expires_at) < new Date()

  // Generate breadcrumbs
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'SEO Jobs', href: '/' }
  ]
  
  if (job.city) {
    breadcrumbItems.push({ 
      label: job.city, 
      href: `/jobs/city/${job.city.toLowerCase()}` 
    })
  }
  
  breadcrumbItems.push({ 
    label: `${job.title} at ${job.company_name}` 
  })

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems, 'https://seo-vacancy.eu')
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      
      {/* Expired Job Banner */}
      {isExpired && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                No Longer Accepting Applications
              </h2>
              <p className="text-red-600">
                This job listing expired on{' '}
                <span className="font-medium" suppressHydrationWarning>
                  {new Date(job.expires_at!).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </span>
                {' '}and is no longer accepting new applications.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4 flex-1">
                  {job.company_logo && job.company_logo.trim() && job.company_logo !== "'" && (
                    <Image
                      src={job.company_logo}
                      alt={job.company_name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      unoptimized
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold mb-2">{job.title}{job.city ? ` ${job.city}` : ''}</h1>
                    <div className="flex items-center gap-2 text-xl text-gray-600">
                      <Building2 className="h-5 w-5" />
                      <span>{job.company_name}</span>
                    </div>
                  </div>
                </div>
                {job.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Featured
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pt-4">
                {job.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <Link href={`/jobs/city/${job.city.toLowerCase()}`} className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                      {job.city}
                    </Link>
                  </div>
                )}
                {job.category && job.category !== 'FULL_TIME' && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.category}</span>
                  </div>
                )}
                {job.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span suppressHydrationWarning>Posted {new Date(job.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
          
          {job.teaser && job.teaser.trim() && (
            <Card className="bg-blue-50/50 border-blue-100">
              <CardHeader>
                <h2 className="text-xl font-semibold">What Makes This Opportunity Special</h2>
              </CardHeader>
              <CardContent>
                <div className="rich-article">
                  <ReactMarkdown>
                    {job.teaser}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Job Description</h2>
            </CardHeader>
            <CardContent>
              <ExpandableJobDescription
                description={job.description || 'No description available.'}
              />
            </CardContent>
          </Card>

          {job.company_info && job.company_info.trim() && job.city && job.city !== 'Remote' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">About {job.company_name}</h2>
              </CardHeader>
              <CardContent>
                <div className="rich-article">
                  <ReactMarkdown>
                    {job.company_info}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {job.faq && job.faq.trim() && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
              </CardHeader>
              <CardContent>
                <div className="rich-article">
                  <ReactMarkdown
                    components={{
                      h2: ({children}) => <h2 className="text-base font-bold my-2">{children}</h2>
                    }}
                  >
                    {job.faq}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
          
          {job.tags && job.tags.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Skills & Requirements</h2>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <Link key={index} href={`/jobs/tag/${createTagSlug(tag)}`}>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 cursor-pointer transition-colors border-0">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">
                {isExpired ? 'Application Closed' : 'Apply for this position'}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {isExpired ? (
                <Button 
                  size="lg" 
                  className="w-full gap-2 bg-gray-400 text-gray-700 cursor-not-allowed" 
                  disabled
                >
                  No Longer Available
                  <ExternalLink className="h-4 w-4" />
                </Button>
              ) : (
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button size="lg" className="w-full gap-2">
                    Apply Now
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
              
              {job.expires_at && (
                <p className="text-sm text-gray-500 text-center">
                  <span suppressHydrationWarning>Application deadline: {new Date(job.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Job Details</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Salary (shown only when not hidden and values exist) */}
              {job.hide_salary !== true && (job.salary_min !== null || job.salary_max !== null) && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary:</span>
                  <span className="font-medium">
                    {(() => {
                      const currency = job.salary_currency || ''
                      const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n)
                      const min = job.salary_min ?? undefined
                      const max = job.salary_max ?? undefined
                      if (min != null && max != null) return `${currency}${fmt(min)} - ${currency}${fmt(max)}`
                      if (min != null) return `From ${currency}${fmt(min)}`
                      if (max != null) return `Up to ${currency}${fmt(max)}`
                      return null
                    })()}
                  </span>
                </div>
              )}
              {job.city && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <Link href={`/jobs/city/${job.city.toLowerCase()}`} className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                    {job.city}
                  </Link>
                </div>
              )}
              {job.category && job.category !== 'FULL_TIME' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{job.category}</span>
                </div>
              )}
              {job.created_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium" suppressHydrationWarning>{new Date(job.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Related Jobs Section */}
      {job.city && (
        <div className="mt-12">
          <RelatedJobs currentJobId={job.id} city={job.city} />
        </div>
      )}
      
      {/* JSON-LD Structured Data */}
      {(() => {
        // Build JobPosting schema, optionally adding baseSalary if shown on page
        const hasSalary = job.hide_salary !== true && (job.salary_min !== null || job.salary_max !== null)
        const schema: Record<string, unknown> = {
          "@context": "https://schema.org/",
          "@type": "JobPosting",
          title: job.title,
          description: job.description?.replace(/<[^>]*>/g, '') || '',
          identifier: {
            "@type": "PropertyValue",
            name: "Job ID",
            value: job.id,
          },
          datePosted: job.created_at,
          validThrough: job.expires_at,
          employmentType: "FULL_TIME",
          hiringOrganization: {
            "@type": "Organization",
            name: job.company_name,
          },
          jobLocation: job.city ? {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.city,
            },
          } : undefined,
          industry: job.category,
        }

        if (hasSalary) {
          const value: Record<string, unknown> = {
            "@type": "QuantitativeValue",
          }
          if (job.salary_min !== null) value.minValue = job.salary_min
          if (job.salary_max !== null) value.maxValue = job.salary_max
          // Default to YEAR when unspecified; mirrors page-level display semantics
          value.unitText = 'YEAR'

          const baseSalary: Record<string, unknown> = {
            "@type": "MonetaryAmount",
            value,
          }
          if (job.salary_currency) baseSalary.currency = job.salary_currency

          schema.baseSalary = baseSalary
        }

        return (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        )
      })()}

      {/* FAQ JSON-LD Schema */}
      {job.faq && job.faq.trim() && (() => {
        // Parse FAQ markdown to extract Q&A pairs
        const faqContent = job.faq.trim()
        const faqItems: Array<{question: string, answer: string}> = []

        // Split by markdown headers (## or #)
        const sections = faqContent.split(/^#+\s+/gm).filter(section => section.trim())

        sections.forEach(section => {
          const lines = section.trim().split('\n')
          if (lines.length >= 2) {
            const question = lines[0].trim()
            const answer = lines.slice(1).join('\n').trim()
            if (question && answer) {
              faqItems.push({ question, answer })
            }
          }
        })

        if (faqItems.length > 0) {
          const faqSchema = {
            "@context": "https://schema.org/",
            "@type": "FAQPage",
            mainEntity: faqItems.map(item => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer.replace(/<[^>]*>/g, '')
              }
            }))
          }

          return (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
          )
        }

        return null
      })()}
      
      {/* Breadcrumb JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      
      {/* Bot Tracking Pixel - Invisible 1x1 GIF for tracking bot visits */}
      <Image
        src={`/.netlify/functions/track-bot-visit?job=${encodeURIComponent(slug)}&prerendered=true`}
        alt=""
        width={1}
        height={1}
        style={{ 
          position: 'absolute', 
          width: '1px', 
          height: '1px', 
          opacity: 0,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
        unoptimized
      />
    </div>
  )
}
