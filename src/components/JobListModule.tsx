import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/JobCard'
import type { BlogPost, BlogModule, JobListModule } from '@/types/blog'

interface JobListModuleProps extends Omit<JobListModule, 'type'> {}

export async function JobListModule({ title, tag, city, limit = 6 }: JobListModuleProps) {
  const supabase = await createClient()

  let query = supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(limit)

  if (tag) {
    // Filter by tag: Supabase array contains
    query = query.contains('tags', [tag]) as any
  }
  if (city) {
    query = query.eq('city', city)
  }

  const { data: jobs, error } = await query
  if (error || !jobs || jobs.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      {title && <h3 className="text-xl font-semibold">{title}</h3>}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {jobs.map(job => (
          <JobCard key={job.id} job={job as any} />
        ))}
      </div>
    </section>
  )
}

export async function RenderModules({ modules }: { modules?: BlogPost['modules'] }) {
  if (!modules || modules.length === 0) return null
  return (
    <div className="space-y-8">
      {await Promise.all(modules.map(async (mod, idx) => {
        if (mod.type === 'jobList') {
          return <JobListModule key={idx} {...mod} />
        }
        return null
      }))}
    </div>
  )
}

