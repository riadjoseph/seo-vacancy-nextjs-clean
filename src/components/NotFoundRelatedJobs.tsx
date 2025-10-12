'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin } from 'lucide-react'
import { createPublicClient } from '@/lib/supabase/public'
import { JobCard } from '@/components/JobCard'
import type { Tables } from '@/lib/supabase/types'

type Job = Tables<'jobs'>

export function NotFoundRelatedJobs() {
  const pathname = usePathname()
  const [city, setCity] = useState<string | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedJobs() {
      // Extract slug from pathname
      const match = pathname?.match(/\/job\/([^/?]+)/)
      const slug = match ? match[1] : null

      if (!slug) {
        setLoading(false)
        return
      }

      const supabase = createPublicClient()

      // Try to get the job from database to find its city
      const { data: job } = await supabase
        .from('jobs')
        .select('city')
        .eq('slug', slug)
        .single()

      let cityName: string | null = null

      if (job?.city) {
        cityName = job.city
      } else {
        // Fallback: Try to extract city from slug pattern
        // Typical pattern: "job-title-company-city"
        const parts = slug.split('-')
        if (parts.length >= 2) {
          const possibleCity = parts[parts.length - 1]
          cityName = possibleCity.charAt(0).toUpperCase() + possibleCity.slice(1)
        }
      }

      if (cityName) {
        // Get active jobs from the same city
        const { data: cityJobs } = await supabase
          .from('jobs')
          .select('*')
          .ilike('city', cityName)
          .gt('expires_at', new Date().toISOString())
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6)

        if (cityJobs && cityJobs.length > 0) {
          setCity(cityName)
          setJobs(cityJobs)
        }
      }

      setLoading(false)
    }

    fetchRelatedJobs()
  }, [pathname])

  if (loading) {
    return (
      <div className="mt-12 text-center text-muted-foreground">
        <p>Loading related jobs...</p>
      </div>
    )
  }

  if (!city || jobs.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Vacant SEO Jobs in {city}
        </h2>
        <p className="text-muted-foreground mt-2">
          Check out these available SEO opportunities in {city}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.slice(0, 6).map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href={`/jobs/city/${city.toLowerCase()}`}>
          <Button variant="outline" size="lg">
            View All SEO Jobs in {city}
          </Button>
        </Link>
      </div>
    </div>
  )
}
