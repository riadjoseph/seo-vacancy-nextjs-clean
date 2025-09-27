import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostJobForm } from '@/components/PostJobForm'

export const metadata: Metadata = {
  title: 'Post a Job - SEO Jobs in Europe',
  description: 'Post your SEO, marketing, and tech job opportunities on the leading European job board',
}

export default async function PostJobPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/signin?redirect=/post-job')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Post a Job</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Reach thousands of SEO and tech professionals across Europe
        </p>
      </div>
      
      <PostJobForm />
    </div>
  )
}