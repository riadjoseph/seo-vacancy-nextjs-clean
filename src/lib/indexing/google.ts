// Google Indexing API client

import { google } from 'googleapis'
import type { GoogleIndexingResult, IndexingNotificationType, GoogleServiceAccount } from './types'

/**
 * Submit URLs to Google Indexing API
 * @param urls Array of URLs to submit
 * @param type Notification type (URL_UPDATED or URL_DELETED)
 * @returns Array of results for each URL
 */
export async function submitToGoogleIndexing(
  urls: string[],
  type: IndexingNotificationType
): Promise<GoogleIndexingResult[]> {
  if (urls.length === 0) {
    return []
  }

  try {
    const serviceAccount = getServiceAccount()
    const accessToken = await getAccessToken(serviceAccount)

    // Submit in batches of 100 URLs
    const batchSize = 100
    const results: GoogleIndexingResult[] = []

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      const batchResults = await submitBatch(batch, type, accessToken)
      results.push(...batchResults)

      // Small delay between batches to avoid rate limits
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    return results
  } catch (error) {
    const err = error as Error
    console.error('Google Indexing API error:', err.message)

    // Return error for all URLs
    return urls.map(url => ({
      success: false,
      url,
      type,
      error: err.message
    }))
  }
}

/**
 * Get service account from environment variable
 */
function getServiceAccount(): GoogleServiceAccount {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON

  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set')
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson) as GoogleServiceAccount

    // CRITICAL: Fix newline characters in private key
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')

    return serviceAccount
  } catch (error) {
    throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON')
  }
}

/**
 * Get access token using JWT authentication
 */
async function getAccessToken(serviceAccount: GoogleServiceAccount): Promise<string> {
  const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    undefined,
    serviceAccount.private_key,
    ['https://www.googleapis.com/auth/indexing'],
    undefined
  )

  await jwtClient.authorize()

  const token = await jwtClient.getAccessToken()
  if (!token.token) {
    throw new Error('Failed to get access token')
  }

  return token.token
}

/**
 * Submit a batch of URLs to Google Indexing API
 */
async function submitBatch(
  urls: string[],
  type: IndexingNotificationType,
  accessToken: string
): Promise<GoogleIndexingResult[]> {
  // Build multipart/mixed batch request
  const boundary = `batch_${Date.now()}`
  const parts: string[] = []

  urls.forEach((url, index) => {
    const body = JSON.stringify({
      url,
      type
    })

    parts.push(
      `--${boundary}`,
      'Content-Type: application/http',
      'Content-ID: ' + (index + 1),
      '',
      'POST /v3/urlNotifications:publish HTTP/1.1',
      'Content-Type: application/json',
      '',
      body
    )
  })

  parts.push(`--${boundary}--`)

  const batchBody = parts.join('\r\n')

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)

    const response = await fetch('https://indexing.googleapis.com/batch', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/mixed; boundary=${boundary}`,
        'Authorization': `Bearer ${accessToken}`
      },
      body: batchBody,
      signal: controller.signal
    })

    clearTimeout(timer)

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`)
    }

    // Parse batch response
    return parseBatchResponse(urls, type, responseText)
  } catch (error) {
    const err = error as { name?: string; message?: string }
    const isTimeout = err?.name === 'AbortError'
    const errorMessage = isTimeout ? 'Request timed out' : (err?.message || 'Network error')

    return urls.map(url => ({
      success: false,
      url,
      type,
      error: errorMessage
    }))
  }
}

/**
 * Parse Google's batch response
 */
function parseBatchResponse(
  urls: string[],
  type: IndexingNotificationType,
  responseText: string
): GoogleIndexingResult[] {
  // Simple parsing - check if each URL's response contains a 200 status
  const results: GoogleIndexingResult[] = []

  urls.forEach(url => {
    // Very basic parsing - in a production system you might want more robust parsing
    const urlPattern = `"url": "${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`
    const hasUrl = responseText.includes(url)
    const hasSuccess = responseText.includes('HTTP/1.1 200')

    results.push({
      success: hasUrl && hasSuccess,
      url,
      type,
      error: hasSuccess ? undefined : 'Submission may have failed - check logs'
    })
  })

  return results
}

/**
 * Submit URLs with retry logic
 */
export async function submitToGoogleIndexingWithRetry(
  urls: string[],
  type: IndexingNotificationType,
  maxRetries = 3
): Promise<GoogleIndexingResult[]> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await submitToGoogleIndexing(urls, type)
    } catch (error) {
      lastError = error as Error

      // Don't retry on auth errors
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        throw error
      }

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}
