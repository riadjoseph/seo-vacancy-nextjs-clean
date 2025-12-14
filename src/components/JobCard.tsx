"use client"

import Link from 'next/link'
import Image from 'next/image'
import { LazyMarkdown } from '@/components/LazyMarkdown'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, Calendar } from 'lucide-react'
import { createTagSlug } from '@/utils/tagUtils'
import type { Tables } from '@/lib/supabase/types'

type Job = Tables<'jobs'>

interface JobCardProps {
  job: Job
  isFeatured?: boolean
}

function createJobSlug(title: string, company: string, city: string | null): string {
  const slug = `${title}-${company}-${city || 'remote'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return slug
}

export function JobCard({ job, isFeatured = false }: JobCardProps) {
  const slug = createJobSlug(job.title, job.company_name, job.city)
  
  const cardClasses = isFeatured
    ? "rounded-lg text-card-foreground shadow-sm p-6 hover:shadow-lg transition-all duration-300 border-2 border-primary/20 bg-primary/5"
    : "hover:shadow-md transition-shadow duration-200"
  
  return (
    <Card className={cardClasses}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-3 flex-1">
            {job.company_logo && job.company_logo.trim() && job.company_logo !== "'" && (
              <Image
                src={job.company_logo}
                alt={job.company_name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                unoptimized
              />
            )}
            <div className="flex-1 min-w-0">
              <Link 
                href={`/job/${slug}`}
                className="block"
              >
                <h3 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2">
                  {job.title}
                </h3>
              </Link>
              <p className="text-muted-foreground font-medium mt-1">{job.company_name}</p>
            </div>
          </div>
          {job.featured && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {job.city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <Link href={`/jobs/city/${job.city.toLowerCase()}`} className="text-primary hover:text-primary/80 hover:underline transition-colors">
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
              <span suppressHydrationWarning>{new Date(job.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        <div
          className="text-muted-foreground line-clamp-3 text-sm prose prose-sm max-w-none"
          data-nosnippet
        >
          <LazyMarkdown>
            {job.description?.substring(0, 150) + '...' || ''}
          </LazyMarkdown>
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.tags.slice(0, 3).map((tag, index) => (
              <Link key={index} href={`/jobs/tag/${createTagSlug(tag)}`}>
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors">
                  {tag}
                </Badge>
              </Link>
            ))}
            {job.tags.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{job.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-start items-center pt-2">
          <Link href={`/job/${slug}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
