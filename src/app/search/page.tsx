import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/JobCard'
import { GeneralSearchBox } from '@/components/GeneralSearchBox'
import { ServerPagination, ServerPaginationSummary } from '@/components/ui/server-pagination'
import { calculatePagination } from '@/utils/pagination'
import { ArrowLeft } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    page?: string
  }>
}

async function searchJobs(query: string, page: number = 1) {
  if (!query.trim()) {
    return { jobs: [], totalCount: 0 }
  }

  const supabase = await createClient()
  const itemsPerPage = 25
  const offset = (page - 1) * itemsPerPage

  // Search across multiple fields
  const searchFilter = `title.ilike.%${query}%,company_name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,city.ilike.%${query}%`

  const { data: allJobs, error } = await supabase
    .from('jobs')
    .select('*')
    .or(searchFilter)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching jobs:', error)
    return { jobs: [], totalCount: 0 }
  }

  // Filter out expired jobs
  const currentDate = new Date().toISOString()
  const activeJobs = allJobs?.filter(job =>
    !job.expires_at || new Date(job.expires_at).getTime() > new Date(currentDate).getTime()
  ) || []

  // Paginate the results
  const paginatedJobs = activeJobs.slice(offset, offset + itemsPerPage)

  return {
    jobs: paginatedJobs,
    totalCount: activeJobs.length
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams
  const query = params.q || ''
  const page = parseInt(params.page || '1', 10)

  if (!query.trim()) {
    return {
      title: 'Search SEO Jobs | SEO & GEO Jobs Europe',
      description: 'Search for SEO, marketing, and tech job opportunities across Europe.',
      alternates: {
        canonical: '/search',
      },
    }
  }

  const { totalCount } = await searchJobs(query, 1)
  const pageTitle = page > 1 ? ` - Page ${page}` : ''
  const canonicalPath = page > 1 ? `/search?q=${encodeURIComponent(query)}&page=${page}` : `/search?q=${encodeURIComponent(query)}`

  return {
    title: `${totalCount} results for "${query}"${pageTitle} | SEO Jobs`,
    description: `Found ${totalCount} job opportunities matching "${query}". Search SEO, marketing, and tech jobs across Europe.`,
    alternates: {
      canonical: canonicalPath,
    },
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const currentPage = Math.max(1, parseInt(params.page || '1', 10))

  const { jobs, totalCount } = await searchJobs(query, currentPage)
  const paginationData = calculatePagination(currentPage, totalCount, 25)

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        {query && (
          <p className="text-muted-foreground">
            {totalCount > 0
              ? `Found ${totalCount} result${totalCount === 1 ? '' : 's'} for "${query}"`
              : `No results found for "${query}"`
            }
          </p>
        )}
      </div>

      {/* Search Box */}
      <GeneralSearchBox />

      {/* Results */}
      {!query.trim() ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Enter a search term</h2>
          <p className="text-muted-foreground">
            Search for jobs, companies, cities, or skills to find relevant opportunities.
          </p>
        </div>
      ) : totalCount === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-muted-foreground mb-4">
            Try different keywords or browse all jobs.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse All Jobs
          </Link>
        </div>
      ) : (
        <>
          {/* Results summary */}
          <div className="flex justify-between items-center mb-6">
            <ServerPaginationSummary data={paginationData} />
          </div>

          {/* Job Results */}
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <div className="flex justify-center">
              <ServerPagination
                data={paginationData}
                basePath="/search"
                searchParams={{ q: query }}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}