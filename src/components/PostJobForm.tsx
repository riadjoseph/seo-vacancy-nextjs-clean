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
import type { SeoSpecialization } from '@/data/types'
import { addDays, format } from 'date-fns'

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

const initialFormData: FormData = {
  title: '',
  company_name: '',
  company_logo: '',
  city: '',
  description: '',
  faq: '',
  company_info: '',
  tags: [],
  category: '',
  job_url: '',
  salary_min: '',
  salary_max: '',
  salary_currency: '€',
  hide_salary: false,
  start_date: format(new Date(), 'yyyy-MM-dd'),
  duration: '30',
  featured: false
}

export function PostJobForm() {
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
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to post a job.',
          variant: 'destructive',
        })
        return
      }

      // Calculate expiry date
      const expiresAt = addDays(new Date(formData.start_date), parseInt(formData.duration))

      const jobData = {
        title: formData.title.trim(),
        company_name: formData.company_name.trim(),
        company_logo: formData.company_logo.trim() || null,
        city: formData.city,
        description: formData.description.trim(),
        faq: formData.faq.trim() || null,
        company_info: formData.company_info.trim() || null,
        tags: formData.tags, // This should work with seo_specialization[] type
        category: formData.category,
        job_url: formData.job_url.trim(),
        salary_min: formData.hide_salary ? null : parseInt(formData.salary_min) || null,
        salary_max: formData.hide_salary ? null : parseInt(formData.salary_max) || null,
        salary_currency: formData.hide_salary ? null : formData.salary_currency,
        expires_at: expiresAt.toISOString(),
        featured: formData.featured,
        user_id: user.id,
        // Remove unused fields that have defaults:
        // rating: null, (has default)
        // reviews: null, (has default 0)
        // bookmarks: null, (has default 0)
        // posted_date: null, (has default now())
        // created_at: null, (has default now())
        // start_date: null, (not used per your notes)
        // location: null, (not used, city is used instead)
        // slug: null, (generated by trigger)
      }

      const { error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single()

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
          description: error.message || 'Failed to post job. Please try again.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success!',
        description: 'Your job has been posted successfully.',
      })

      // Redirect to my-jobs page
      router.push('/my-jobs')
    } catch (error) {
      console.error('Error posting job:', error)
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
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Post Job'}
        </Button>
      </div>
    </form>
  )
}