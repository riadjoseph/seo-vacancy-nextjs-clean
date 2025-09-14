"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { JobCard } from '@/components/JobCard'
import type { Tables } from '@/lib/supabase/types'

type ApiResponse = {
  ok: boolean
  message: string
  submitted?: number
  endpoint?: string
  detail?: any
}

export default function IndexNowToolPage() {
  const [key, setKey] = useState('')
  const [urls, setUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [touched, setTouched] = useState(false)
  const [jobs, setJobs] = useState<Tables<'jobs'>[] | null>(null)
  const [jobsLoading, setJobsLoading] = useState(true)

  type Parsed = {
    lines: number
    valid: string[]
    invalid: string[]
    duplicatesRemoved: number
    host: string | null
    schemeOk: boolean
  }

  const parseInput = (text: string): Parsed => {
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
  }

  const parsed = useMemo(() => parseInput(urls), [urls])
  const keyLocation = parsed.host ? `https://${parsed.host}/${key || '<key>'}.txt` : null

  const canSubmit = !loading
    && key.trim().length > 0
    && parsed.valid.length > 0
    && parsed.valid.length <= 50
    && !!parsed.host
    && parsed.schemeOk

  // Fetch recent Technical SEO jobs for the module section
  useEffect(() => {
    let mounted = true
    const run = async () => {
      try {
        setJobsLoading(true)
        const res = await fetch(`/api/jobs/by-tag?tag=${encodeURIComponent('Technical SEO')}&limit=6`)
        const data = await res.json()
        if (mounted) {
          setJobs(data?.ok ? data.items : [])
        }
      } catch {
        if (mounted) setJobs([])
      } finally {
        if (mounted) setJobsLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [])

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
    } catch (err: any) {
      setResult({ ok: false, message: err?.message || 'Unexpected error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">IndexNow Submitter</h1>
      <Card>
        <CardHeader>
          <div className="text-gray-700 text-sm space-y-2">
            <p className="font-medium">How to use IndexNow</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>
                Step 1: Visit
                {' '}<a href="https://www.bing.com/indexnow/getstarted#implementation" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">IndexNow Get Started</a>,
                {' '}click <span className="font-medium">Generate</span>, then <span className="font-medium">Download</span> the key file. You’ll recieve a file — keep the filename exactly as generated.
              </li>
              <li>
                Step 2: Upload that file to the <span className="font-medium">root of your website</span> (so it’s accessible at <code>https://&lt;your-domain&gt;/&lt;key&gt;.txt</code>).
                {' '}Need help? <a href="/contact" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Contact me</a>.
              </li>
              <li>
                Step 3: Use the form below to submit up to <span className="font-medium">50 URLs</span> to IndexNow.
              </li>
            </ol>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">IndexNow Key</label>
              <Input value={key} onChange={e => { setKey(e.target.value); setTouched(true) }} placeholder="e.g. 1234567890abcdef..." required />
              {touched && !key.trim() && (
                <p className="text-xs text-red-600 mt-1">Enter your IndexNow key.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URLs (one per line, max 50)</label>
              <Textarea value={urls} onChange={e => { setUrls(e.target.value); setTouched(true) }} placeholder="https://www.example.com/page-1\nhttps://www.example.com/page-2" rows={8} />
              <div className="text-xs text-gray-600 mt-1">
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
            {/* Preflight checklist */}
            <div className="rounded border bg-gray-50 p-3 text-sm">
              <div className="font-medium mb-2">Preflight checks</div>
              <ul className="space-y-1">
                <li className={parsed.host ? 'text-green-700' : 'text-red-700'}>
                  Hostname consistency: {parsed.host ? parsed.host : 'Mixed hostnames detected'}
                </li>
                <li className={parsed.schemeOk ? 'text-green-700' : 'text-red-700'}>
                  URL scheme: {parsed.schemeOk ? 'All http/https' : 'Invalid schemes present'}
                </li>
                <li className={parsed.valid.length > 0 && parsed.valid.length <= 50 ? 'text-green-700' : 'text-red-700'}>
                  URL count: {parsed.valid.length} valid (max 50)
                </li>
                <li className="text-gray-700">
                  Key file: {keyLocation ? keyLocation : '—'} (checked on submit)
                </li>
              </ul>
            </div>

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
            <p className="text-xs text-gray-500 mt-2">
              We don’t store your key or URLs. They are used only to validate the key file and submit your request to IndexNow.
            </p>
            {result?.detail && (
              <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border overflow-auto max-h-64">{JSON.stringify(result.detail, null, 2)}</pre>
            )}
          </form>
        </CardContent>
      </Card>
      
      {/* Tool features */}
      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-bold">What this tool does</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Built-in safeguards</h3>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                <li>Hostname consistency: blocks mixed www/non‑www or cross-domain lists</li>
                <li>URL validation: accepts only http/https absolute URLs</li>
                <li>De-duplication: removes duplicate lines automatically</li>
                <li>Limit control: enforces up to 50 URLs per submission</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Smart submission</h3>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                <li>Key pre-check: verifies <code>&lt;key&gt;.txt</code> is reachable and matches</li>
                <li>Clear errors: explains 404 vs mismatch vs network issues</li>
                <li>Timeout handling: avoids hanging requests with 10s timeouts</li>
                <li>Aggregator endpoint: submits once, reaches multiple engines</li>
              </ul>
            </CardContent>
          </Card>
        </div>
        {/* Why this tool */}
        <Card className="mt-4">
          <CardHeader>
            <h3 className="text-lg font-semibold">Why use this tool over other methods?</h3>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
              <li>Foolproof checks before sending: hostname consistency, scheme validation, and de-duplication. We double-check and triple-check the basics so you don’t have to.</li>
              <li>Key verification: confirms your <code>&lt;key&gt;.txt</code> is live and matches before any submission.</li>
              <li>Actionable guidance: clear messages and a preflight checklist to prevent common mistakes.</li>
              <li>Broad reach with one call: uses the IndexNow aggregator endpoint shared across engines.</li>
              <li>Practical for SEO workflows: definately reduces failed pings, helping fresh changes get accepted faster.</li>
              <li>Privacy-friendly: keys and URLs are used only for submission; nothing is stored server-side.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Article */}
      <article className="mt-10 rich-article">
        <h2>What is IndexNow?</h2>
        <p>
          IndexNow is a lightweight, open protocol that lets your site notify participating search engines the moment you add, update, or delete a URL. Instead of waiting for bots to discover changes, you “ping” them—via a simple GET or JSON POST—and they share those URLs across other IndexNow engines. Up to 10,000 URLs per POST are allowed.
        </p>

        <h3>Which search engine support IndexNow?</h3>
        <p>
          IndexNow is supported by Microsoft Bing and other engines (e.g., Seznam, Naver, Yandex, and more). Engines that adopt IndexNow agree to share submitted URLs with other participants, so you can notify one endpoint and reach many.
        </p>

        <hr />

        <h3>Why use IndexNow?</h3>
        <ul>
          <li><strong>Speed:</strong> Get fresh/changed pages crawled faster (think news, jobs, inventory, prices, PDPs).</li>
          <li><strong>Efficiency:</strong> Reduce unnecessary crawling by guiding bots to what actually changed.</li>
          <li><strong>Control:</strong> Push critical updates (301s, deletions, urgent fixes) immediately.</li>
          <li><strong>Simplicity:</strong> One call, shared to multiple participating engines.</li>
        </ul>
        <p><em>Best practice:</em> use IndexNow for recently changed URLs; use sitemaps for the full inventory.</p>
      </article>

      {/* Appendix */}
      <article className="mt-10 rich-article">
        <h2>Appendix: How to host your &lt;key&gt;.txt on popular platforms</h2>

        <h3>WordPress</h3>
        <p><strong>Method A (File Manager / SFTP)</strong></p>
        <ol>
          <li>Connect via your host’s File Manager or SFTP.</li>
          <li>Navigate to the WordPress root folder (where you see <code>/wp-admin</code>, <code>/wp-content</code>, <code>/wp-includes</code>).</li>
          <li>Upload your file <code>&lt;key&gt;.txt</code> there.</li>
          <li>Confirm it’s live at <code>https://yourdomain.com/&lt;key&gt;.txt</code>.</li>
        </ol>
        <p><strong>Method B (Plugin)</strong></p>
        <ul>
          <li>Plugins like “IndexNow for WordPress” handle key hosting and submissions automatically.</li>
          <li>In the plugin settings, paste your generated key or let it create one.</li>
        </ul>

        <h3>Next.js</h3>
        <p><strong>Step 1: Create a public asset</strong></p>
        <p>Place the key file in your project’s <code>/public</code> folder:</p>
        <pre><code>/public/&lt;key&gt;.txt</code></pre>
        <p>File content = the key string (exact match, no extra spaces).</p>
        <p><strong>Step 2: Deploy</strong></p>
        <p>After deploy (Vercel, Netlify, etc.), it’s served at <code>https://yourdomain.com/&lt;key&gt;.txt</code>.</p>
        <p><strong>Alternative: Route handler</strong> if you prefer not to store a file:</p>
        <pre><code>{`// app/[key].txt/route.ts
export async function GET() {
  return new Response("YOUR_KEY_HERE", {
    headers: { "Content-Type": "text/plain" },
  })
}`}</code></pre>

        <h3>Cloudflare Pages / Workers</h3>
        <p><strong>Cloudflare Pages:</strong> Add your key file to the project’s <code>/public</code> directory (same as Next.js). It will deploy as <code>https://yourdomain.com/&lt;key&gt;.txt</code>.</p>
        <p><strong>Cloudflare Workers (if not using Pages):</strong> Add a route to return the key:</p>
        <pre><code>{`export default {
  async fetch(request) {
    const url = new URL(request.url)
    if (url.pathname === "/<key>.txt") {
      return new Response("<your-key>", { headers: { "Content-Type": "text/plain" } })
    }
    return fetch(request)
  }
}`}</code></pre>
        <p>Bind the worker to your root domain.</p>

        <h3>Shopify</h3>
        <p>Shopify doesn’t give direct access to the server root, but you can still expose a .txt file.</p>
        <p><strong>Method A — Files Upload (recommended)</strong></p>
        <ol>
          <li>In Shopify admin, go to <em>Content → Files</em>.</li>
          <li>Upload your <code>&lt;key&gt;.txt</code> file.</li>
          <li>Copy the public URL Shopify generates (e.g., <code>https://cdn.shopify.com/s/files/.../key.txt</code>).</li>
          <li>In your IndexNow submission payload, set <code>keyLocation</code> to this full URL.</li>
        </ol>
        <p>
          <em>Because the file isn’t at the domain root, you must include</em>
          {' '}
          <code>&quot;keyLocation&quot;: &quot;&lt;that-Shopify-URL&gt;&quot;</code>
          {' '}
          <em>when submitting.</em>
        </p>
        <p><strong>Method B — Custom Page/Template:</strong> create a page that outputs only the key with <code>text/plain</code> header. This is theme-dependent; the Files method is safer.</p>

        <h3>Magento (Adobe Commerce)</h3>
        <ol>
          <li>Use SFTP/SSH to connect to your server.</li>
          <li>Place <code>&lt;key&gt;.txt</code> inside your Magento docroot (where <code>index.php</code> lives), e.g. <code>/var/www/html/&lt;key&gt;.txt</code>.</li>
          <li>Clear caches if necessary (<code>bin/magento cache:clean</code>).</li>
          <li>Test <code>https://yourdomain.com/&lt;key&gt;.txt</code> in a browser.</li>
        </ol>

        <h3>PrestaShop</h3>
        <ol>
          <li>Connect via FTP/SFTP.</li>
          <li>Upload <code>&lt;key&gt;.txt</code> to the root of your PrestaShop installation (where <code>/admin</code>, <code>/themes</code>, <code>/modules</code> exist).</li>
          <li>Verify at <code>https://yourdomain.com/&lt;key&gt;.txt</code>.</li>
        </ol>

        <h3>Verification Checklist (all platforms)</h3>
        <p>Run these tests after uploading:</p>
        <pre><code>curl -i https://yourdomain.com/&lt;key&gt;.txt</code></pre>
        <p>Expect:</p>
        <ul>
          <li>HTTP/1.1 200 OK</li>
          <li>Content-Type: text/plain</li>
          <li>Body matches the key exactly (no HTML, no spaces, no quotes)</li>
        </ul>
        <p>If you’re using a subfolder/CDN path (Shopify), include that exact <code>keyLocation</code> in the IndexNow JSON payload.</p>

        <p><strong>Coverage:</strong> With WordPress, Next.js, Cloudflare, Shopify, Magento, and PrestaShop, most CMS/JAMstack setups are covered. Golden rule: a publicly accessible file at <code>/&lt;key&gt;.txt</code> returning only the key value.</p>
      </article>

      {/* Technical SEO Jobs module */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Technical SEO Jobs recently posted</h2>
        {jobsLoading ? (
          <p className="text-gray-600">Loading jobs…</p>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {jobs.map(j => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No recent Technical SEO jobs found.</p>
        )}
      </div>
    </div>
  )
}
