// IndexNow API client for Bing, Yandex, and other supporting search engines

import type { IndexNowConfig, IndexNowResult } from './types'

/**
 * Submit URLs to IndexNow API
 * @param urls Array of URLs to submit (max 50)
 * @param config IndexNow configuration (key and host)
 * @returns Submission result
 */
export async function submitToIndexNow(
  urls: string[],
  config: IndexNowConfig
): Promise<IndexNowResult> {
  try {
    if (urls.length === 0) {
      return { success: false, submitted: 0, error: 'No URLs provided' }
    }

    if (urls.length > 50) {
      return { success: false, submitted: 0, error: 'Maximum 50 URLs per request' }
    }

    const payload = {
      host: config.host,
      key: config.key,
      keyLocation: `https://${config.host}/${config.key}.txt`,
      urlList: urls
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timer)

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      return {
        success: false,
        submitted: 0,
        error: `IndexNow API returned ${response.status}: ${errorText}`
      }
    }

    return {
      success: true,
      submitted: urls.length
    }
  } catch (error) {
    const err = error as { name?: string; message?: string }
    const isTimeout = err?.name === 'AbortError'
    return {
      success: false,
      submitted: 0,
      error: isTimeout ? 'Request timed out' : (err?.message || 'Network error')
    }
  }
}

/**
 * Validate that the IndexNow key file is accessible
 * @param keyLocation Full URL to the key file
 * @param expectedKey Expected key content
 */
export async function validateKeyFile(
  keyLocation: string,
  expectedKey: string
): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(keyLocation, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal
    })

    clearTimeout(timer)

    if (!response.ok) {
      throw new Error(`Key file not reachable at ${keyLocation} (status ${response.status})`)
    }

    const content = (await response.text()).trim()
    if (content !== expectedKey.trim()) {
      throw new Error('Key file content mismatch')
    }
  } catch (error) {
    clearTimeout(timer)
    const err = error as { name?: string; message?: string }
    const isTimeout = err?.name === 'AbortError'
    throw new Error(isTimeout ? 'Key file request timed out' : (err?.message || 'Failed to validate key file'))
  }
}
