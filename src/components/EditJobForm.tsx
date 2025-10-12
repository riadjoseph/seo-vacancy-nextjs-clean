'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { JobBasicInfo } from '@/components/job-post/JobBasicInfo'
import { JobDescription } from '@/components/job-post/JobDescription'
import { JobSalary } from '@/components/job-post/JobSalary'
import { JobDates } from '@/components/job-post/JobDates'
import { JobFeatured } from '@/components/job-post/JobFeatured'
import { validateJobForm } from '@/utils/jobValidation'
import { createJobSlug } from '@/utils/jobUtils'
import type { SeoSpecialization } from '@/data/types'
import { addDays, format } from 'date-fns'
import type { Tables } from '@/lib/supabase/types'

interface FormData {
  title: string
  company_name: string
  company_logo: string
  city: string
  description: string
  faq: string
  company_info: string
  tags: SeoSpecialization[]
  category: string
  job_url: string
  salary_min: string
  salary_max: string
  salary_currency: string
  hide_salary: boolean
  start_date: string
  duration: string
  featured: boolean
}

interface EditJobFormProps {
  job: Tables<'jobs'>
}

export function EditJobForm({ job }: EditJobFormProps) {
  // Calculate duration from expires_at and created_at/posted_date
  const calculateDuration = () => {
    const startDate = new Date(job.posted_date || job.created_at || new Date())
    const expiresDate = new Date(job.expires_at)
    const diffTime = Math.abs(expiresDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays.toString()
  }

  const initialFormData: FormData = {
    title: job.title,
    company_name: job.company_name,
    company_logo: job.company_logo || '',
    city: job.city || '',
    description: job.description,
    faq: job.faq || '',
    company_info: job.company_info || '',
    tags: (job.tags as SeoSpecialization[]) || [],
    category: job.category,
    job_url: job.job_url,
    salary_min: job.salary_min?.toString() || '',
    salary_max: job.salary_max?.toString() || '',
    salary_currency: job.salary_currency || '€',
    hide_salary: job.hide_salary || false,
    start_date: format(new Date(job.posted_date || job.created_at || new Date()), 'yyyy-MM-dd'),
    duration: calculateDuration(),
    featured: job.featured || false
  }

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCityChange = (value: string) => {
    setFormData(prev => ({ ...prev, city: value }))
    if (errors.city) {
      setErrors(prev => ({ ...prev, city: '' }))
    }
  }

  const handleTagsChange = (tags: SeoSpecialization[]) => {
    setFormData(prev => ({ ...prev, tags }))
    if (errors.tags) {
      setErrors(prev => ({ ...prev, tags: '' }))
    }
  }

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }))
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }))
    }
  }

  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({ ...prev, salary_currency: value }))
  }

  const handleDurationChange = (value: string) => {
    setFormData(prev => ({ ...prev, duration: value }))
    if (errors.duration) {
      setErrors(prev => ({ ...prev, duration: '' }))
    }
  }

  const handleHideSalaryChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      hide_salary: checked,
      salary_min: checked ? '' : prev.salary_min,
      salary_max: checked ? '' : prev.salary_max
    }))
  }

  const handleFeaturedChange = (featured: boolean) => {
    setFormData(prev => ({ ...prev, featured }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const validationErrors = validateJobForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors below and try again.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Verify user is still authenticated
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to update a job.',
          variant: 'destructive',
        })
        router.push(`/auth/signin?redirect=/edit-job/${job.id}`)
        return
      }

      // Double-check ownership before updating
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('user_id')
        .eq('id', job.id)
        .single()

      if (!existingJob || existingJob.user_id !== user.id) {
        toast({
          title: 'Authorization Error',
          description: 'You do not have permission to edit this job.',
          variant: 'destructive',
        })
        return
      }

      // Calculate expiry date
      const expiresAt = addDays(new Date(formData.start_date), parseInt(formData.duration))

      // Generate slug for the job (regenerate in case title, company, or city changed)
      const slug = createJobSlug(formData.title.trim(), formData.company_name.trim(), formData.city || 'remote')

      const jobData = {
        title: formData.title.trim(),
        company_name: formData.company_name.trim(),
        company_logo: formData.company_logo.trim() || null,
        city: formData.city,
        description: formData.description.trim(),
        faq: formData.faq.trim() || null,
        company_info: formData.company_info.trim() || null,
        tags: formData.tags,
        category: formData.category,
        job_url: formData.job_url.trim(),
        salary_min: formData.hide_salary ? null : parseInt(formData.salary_min) || null,
        salary_max: formData.hide_salary ? null : parseInt(formData.salary_max) || null,
        salary_currency: formData.hide_salary ? null : formData.salary_currency,
        expires_at: expiresAt.toISOString(),
        featured: formData.featured,
        hide_salary: formData.hide_salary,
        slug: slug,
      }

      const { error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', job.id)
        .eq('user_id', user.id) // Additional safety check in the query

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        })
        console.error('Data sent:', jobData)
        toast({
          title: 'Error',
          description: error.message || 'Failed to update job. Please try again.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success!',
        description: 'Your job has been updated successfully.',
      })

      // Redirect to my-jobs page
      router.push('/my-jobs')
      router.refresh()
    } catch (error) {
      console.error('Error updating job:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <JobBasicInfo
            formData={formData}
            handleChange={handleChange}
            handleCityChange={handleCityChange}
            errors={errors}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <JobDescription
            formData={formData}
            handleChange={handleChange}
            onTagsChange={handleTagsChange}
            onCategoryChange={handleCategoryChange}
            errors={errors}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Salary Information</CardTitle>
        </CardHeader>
        <CardContent>
          <JobSalary
            formData={formData}
            handleChange={handleChange}
            handleCurrencyChange={handleCurrencyChange}
            onHideSalaryChange={handleHideSalaryChange}
            errors={errors}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <JobDates
            formData={formData}
            handleChange={handleChange}
            handleDurationChange={handleDurationChange}
            errors={errors}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Posting</CardTitle>
        </CardHeader>
        <CardContent>
          <JobFeatured
            formData={formData}
            onFeaturedChange={handleFeaturedChange}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/my-jobs')}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Job'}
        </Button>
      </div>
    </form>
  )
}
