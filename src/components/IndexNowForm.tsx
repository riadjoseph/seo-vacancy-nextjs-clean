"use client"

import { useCallback, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'

type ApiResponse = {
  ok: boolean
  message: string
  submitted?: number
  endpoint?: string
  detail?: unknown
}

export function IndexNowForm() {
  const [key, setKey] = useState('')
  const [urls, setUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [touched, setTouched] = useState(false)

  type Parsed = {
    lines: number
    valid: string[]
    invalid: string[]
    duplicatesRemoved: number
    host: string | null
    schemeOk: boolean
  }

  const parseInput = useCallback((text: string): Parsed => {
    const raw = text.split(/\r?\n/)
    const seen = new Set<string>()
    const valid: string[] = []
    const invalid: string[] = []
    const hosts = new Set<string>()
    let schemeOk = true
    let duplicatesRemoved = 0

    for (const line of raw) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const u = new URL(trimmed)
        if (!/^https?:$/.test(u.protocol)) { schemeOk = false; invalid.push(trimmed); continue }
        const norm = `${u.protocol}//${u.hostname.toLowerCase()}${u.port ? ':'+u.port : ''}${u.pathname}${u.search}${u.hash}`
        if (!seen.has(norm)) {
          seen.add(norm)
          valid.push(norm)
        } else {
          duplicatesRemoved += 1
        }
        hosts.add(u.hostname.toLowerCase())
      } catch {
        invalid.push(trimmed)
      }
    }
    const host = hosts.size === 1 ? Array.from(hosts)[0] : null
    return {
      lines: raw.length,
      valid,
      invalid,
      duplicatesRemoved,
      host,
      schemeOk,
    }
  }, [])

  const parsed = useMemo(() => parseInput(urls), [urls, parseInput])
  const keyLocation = parsed.host ? `https://${parsed.host}/${key || '<key>'}.txt` : null

  const canSubmit = !loading
    && key.trim().length > 0
    && parsed.valid.length > 0
    && parsed.valid.length <= 50
    && !!parsed.host
    && parsed.schemeOk

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    setLoading(true)
    setResult(null)
    try {
      const list = parsed.valid
      const res = await fetch('/api/tools/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, urls: list }),
      })
      const data = await res.json()
      setResult(data)
    } catch (err: unknown) {
      const e = err as Error
      setResult({ ok: false, message: e.message || 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="text-gray-700 dark:text-gray-300 text-sm space-y-2">
          <h2 className="font-medium">How to use IndexNow</h2>
          <ol className="list-decimal pl-5 space-y-4">
            <li>
              <span className="font-bold">Step 1:</span> Visit
              {' '}<a href="https://www.bing.com/indexnow/getstarted#implementation" target="_blank" className="text-blue-600 hover:text-blue-800 underline">IndexNow Get Started</a>,
              {' '}click <span className="font-medium">Generate</span>, then <span className="font-medium">Download</span> the key file. You&apos;ll recieve a file — keep the filename exactly as generated.
              <div className="mt-2">
                <Image
                  src="/img/generate-API-Key-Bing-IndexNow.png"
                  alt="Screenshot showing how to generate an API key on Bing IndexNow Get Started page"
                  width={800}
                  height={600}
                  className="rounded-lg border"
                />
              </div>
            </li>
            <li>
              <span className="font-bold">Step 2:</span> Upload that file to the <span className="font-medium">root of your website</span> (so it&apos;s accessible at <code>https://&lt;your-domain&gt;/&lt;key&gt;.txt</code>).
              {' '}Need help? <a href="/contact" target="_blank" className="text-blue-600 hover:text-blue-800 underline">Contact me</a>.
              <div className="mt-2">
                <Image
                  src="/img/save-key-on-txt-file-public-folder.png"
                  alt="Screenshot showing how to save the key file in the public folder"
                  width={800}
                  height={600}
                  className="rounded-lg border"
                />
              </div>
            </li>
            <li>
              <span className="font-bold">Step 3:</span> Use the form below to submit up to <span className="font-medium">50 URLs</span> to IndexNow.
            </li>
          </ol>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">IndexNow Key: Paste the key you have generated in step 1</label>
            <Input value={key} onChange={e => { setKey(e.target.value); setTouched(true) }} placeholder="e.g. 1234567890abcdef..." required />
            {touched && !key.trim() && (
              <p className="text-xs text-red-600 mt-1">Enter your IndexNow key.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URLs (one per line, max 50)</label>
            <Textarea value={urls} onChange={e => { setUrls(e.target.value); setTouched(true) }} placeholder="https://www.example.com/page-1&#10;https://www.example.com/page-2" rows={8} />
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Lines: {parsed.lines} • Valid URLs: {parsed.valid.length} • Invalid: {parsed.invalid.length} • Duplicates removed: {parsed.duplicatesRemoved} • Host: {parsed.host ?? '—'}
            </div>
            {touched && parsed.invalid.length > 0 && (
              <p className="text-xs text-amber-700 mt-1">Removed {parsed.invalid.length} invalid line(s). Ensure all URLs are absolute and use http/https.</p>
            )}
            {touched && parsed.valid.length > 50 && (
              <p className="text-xs text-red-600 mt-1">You have {parsed.valid.length} valid URLs. Please reduce to 50 or fewer.</p>
            )}
            {touched && parsed.host === null && parsed.valid.length > 0 && (
              <p className="text-xs text-red-600 mt-1">All URLs must share the same hostname. Tip: keep www vs non‑www consistent.</p>
            )}
            {touched && !parsed.schemeOk && (
              <p className="text-xs text-red-600 mt-1">Only http and https URLs are allowed.</p>
            )}
          </div>
          {keyLocation && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Key location:</strong> <code>{keyLocation}</code>
            </div>
          )}
          {result && result.ok && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Status:</strong> Successfully submitted to <a href={result.endpoint} className="text-blue-600 hover:text-blue-800 underline">{result.endpoint}</a>
              <ul className="list-disc pl-5 mt-1">
                <li><strong>HTTP 202 Accepted</strong> or <strong>HTTP 200 OK</strong> means IndexNow received and will process your URLs</li>
                <li>URLs are shared with participating engines (Bing, Yandex, Seznam, Naver)</li>
                <li>Crawling happens on the engine&apos;s schedule; there&apos;s no guaranteed time</li>
              </ul>
            </div>
          )}

          <div className="flex gap-3 items-center">
            <Button type="submit" disabled={!canSubmit}>
              {loading ? 'Validating key and submitting…' : 'Submit to IndexNow'}
            </Button>
            {result && (
              <span className={result.ok ? 'text-green-700' : 'text-red-700'}>
                {result.ok ? 'Key check passed. ' : ''}{result.message}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            We don&apos;t store your key or URLs. They are used only to validate the key file and submit your request to IndexNow.
          </p>
          {typeof result?.detail !== 'undefined' && (
            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border overflow-auto max-h-64">
              {typeof result?.detail === 'string'
                ? (result.detail as string)
                : JSON.stringify(result?.detail as unknown, null, 2)}
            </pre>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
