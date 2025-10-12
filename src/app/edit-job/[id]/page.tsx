import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditJobForm } from '@/components/EditJobForm'

interface EditJobPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: EditJobPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Redirect will happen, but provide basic metadata
    return {
      title: 'Edit Job - SEO Jobs in Europe',
      description: 'Edit your SEO, marketing, and tech job posting',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  // Fetch the job to verify it exists and user owns it
  const { data: job, error } = await supabase
    .from('jobs')
    .select('user_id')
    .eq('id', id)
    .single()

  if (error || !job || job.user_id !== user.id) {
    // For 404 pages, Next.js automatically adds noindex when notFound() is called
    // So we don't need to explicitly set robots metadata here to avoid duplicate meta tags
    return {
      title: 'Job Not Found',
      description: 'The job you are looking for does not exist or you do not have permission to edit it.',
    }
  }

  // Valid edit page
  return {
    title: 'Edit Job - SEO Jobs in Europe',
    description: 'Edit your SEO, marketing, and tech job posting',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/signin?redirect=/edit-job/${id}`)
  }

  // Fetch the job and verify ownership
  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !job) {
    notFound()
  }

  // IMPORTANT: Verify that the job belongs to the current user
  if (job.user_id !== user.id) {
    // Return 404 instead of 403 to not leak information about job existence
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Edit Job</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update your job posting information
        </p>
      </div>

      <EditJobForm job={job} />
    </div>
  )
}
