'use client'

import { useCallback, useMemo } from 'react'
import type { MouseEventHandler } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface ApplyButtonProps {
  jobId: string | number
  jobTitle: string
  companyName: string
  jobUrl: string | null
}

const isLinkedInUrl = (url: string) => {
  try {
    return new URL(url).hostname.endsWith('linkedin.com')
  } catch {
    return false
  }
}

const getFormattedJobUrl = (rawUrl: string) => {
  if (typeof window === 'undefined') return rawUrl

  try {
    const parsed = new URL(rawUrl)
    const isLinkedInDomain = parsed.hostname.endsWith('linkedin.com')

    if (isLinkedInDomain) {
      parsed.hostname = 'www.linkedin.com'
      parsed.search = ''
      parsed.pathname = parsed.pathname.replace(/\/+$/, '')

      const jobIdMatch = parsed.pathname.match(/\/jobs\/view\/(?:.*-)?(\d+)$/)
      if (jobIdMatch && jobIdMatch[1]) {
        const jobId = jobIdMatch[1]
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
        const isIOS = /iPad|iPhone|iPod/i.test(userAgent)
        const isAndroid = /Android/i.test(userAgent)
        const iosAppUrl = `linkedin://jobs/view/${jobId}`
        const androidAppUrl = `linkedin://company-jobs/view?jobId=${jobId}`
        return isIOS ? iosAppUrl : (isAndroid ? androidAppUrl : parsed.toString())
      }

      return parsed.toString()
    }

    return parsed.toString()
  } catch {
    return rawUrl
  }
}

export function ApplyButton({ jobId, jobTitle, companyName, jobUrl }: ApplyButtonProps) {
  const isLinkedIn = useMemo(() => jobUrl != null && isLinkedInUrl(jobUrl), [jobUrl])
  const formattedUrl = useMemo(() => {
    if (!jobUrl) return ''
    return isLinkedIn ? getFormattedJobUrl(jobUrl) : jobUrl
  }, [jobUrl, isLinkedIn])

  const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement>>((event) => {
    if (!jobUrl) return

    trackEvent('job_apply_click', {
      job_id: jobId,
      job_title: jobTitle,
      company: companyName,
    })

    if (!isLinkedIn) return

    event.preventDefault()

    const fallbackUrl = jobUrl
    const targetUrl = formattedUrl || jobUrl

    window.location.href = targetUrl

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isAndroid = /Android/i.test(userAgent)
    const delay = isAndroid ? 750 : 500

    window.setTimeout(() => {
      window.location.href = fallbackUrl
    }, delay)
  }, [jobUrl, jobId, jobTitle, companyName, isLinkedIn, formattedUrl])

  if (!jobUrl) return null

  return (
    <a
      href={formattedUrl || jobUrl}
      onClick={handleClick}
      className="w-full"
    >
      <Button size="lg" className="w-full gap-2">
        Apply Now
        <ExternalLink className="h-4 w-4" />
      </Button>
    </a>
  )
}
