import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/JobCard'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import type { Tables } from '@/lib/supabase/types'

type Job = Tables<'jobs'>

interface RelatedJobsProps {
  currentJobId: string
  city: string | null
}

function capitalizeCity(city: string): string {
  return city
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}


async function getRelatedJobs(currentJobId: string, city: string | null): Promise<Job[]> {
  if (!city) {
    return []
  }

  const supabase = await createClient()
  const currentDate = new Date().toISOString()

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .ilike('city', city)
    .neq('id', currentJobId) // Exclude current job
    .or(`expires_at.is.null,expires_at.gte.${currentDate}`) // Only active jobs
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6) // Get up to 6 jobs

  if (error) {
    console.error('Error fetching related jobs:', error)
    return []
  }

  return jobs || []
}

export async function RelatedJobs({ currentJobId, city }: RelatedJobsProps) {
  if (!city) {
    return null
  }

  const relatedJobs = await getRelatedJobs(currentJobId, city)

  if (relatedJobs.length === 0) {
    return null
  }

  const capitalizedCity = capitalizeCity(city)
  // Show 3-6 jobs based on what's available
  const jobsToShow = relatedJobs.slice(0, Math.max(3, Math.min(6, relatedJobs.length)))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold">Other SEO Jobs in {capitalizedCity}</h2>
        </div>
        <p className="text-sm text-gray-600">
          Discover more SEO opportunities in {capitalizedCity}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobsToShow.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              isFeatured={job.featured || false}
            />
          ))}
        </div>
        
        {relatedJobs.length > 6 && (
          <div className="mt-4 text-center">
            <Link 
              href={`/jobs/city/${city.toLowerCase()}`}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              View all {relatedJobs.length} SEO jobs in {capitalizedCity} →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}