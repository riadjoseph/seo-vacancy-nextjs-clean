import { NextRequest, NextResponse } from 'next/server'

type Body = {
  key?: string
  urls?: string[]
}

function sameHost(urls: string[]) {
  try {
    const first = new URL(urls[0])
    // Use hostname to ignore ports; normalize to lowercase
    const host = first.hostname.toLowerCase()
    // Require http/https scheme
    if (!/^https?:$/.test(first.protocol)) return false
    return urls.every(u => {
      const cur = new URL(u)
      return /^https?:$/.test(cur.protocol) && cur.hostname.toLowerCase() === host
    })
  } catch {
    return false
  }
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0',
  'Referer': 'https://www.seo-vacancy.eu/tools',
  // Dummy cookies to mimic a regular browser session (not used for auth)
  'Cookie': [
    'JSESSIONID=ajax:8811086029571736640',
    'lang=v=2&lang=en-us',
    'bcookie=v=2&2e698b8a-596c-4741-898d-17724129ffbc',
    'bscookie=v=1&202501051416341e016df9-b398-41cf-87ee-11656778dfebAQHKQb43iycT5uWYzfadweoPwiGRiQ7d',
    'li_gc=MTs0MjsxNzM2MDg2NjE1OzI7MDIxHUBRQWYQy4DCGLB0ys5/KLUKUNvVT+cgLWedehILiow=',
    'lidc=b=TGST02:s=S:r=T:a=T:p=T:g=3437:u=1:x=1:i=1736086594:t=1736172994:v=2:sig=AQEHIalBtBc8S5ZcNIUxJnYsa0NYi4rw',
    '__cf_bm=ZkUBFvNRKHyPEukbykey3JK5lXLTXt8iRRn.6EoX_Vo-1736086594-1.0.1.1-DrXgiww5w7QK51tNgKnlQy4OTMFJSlkPU9rHBuUs',
    'li_alerts=e30=',
    'g_state={"i_p":1736093799539,"i_l":1}',
  ].join('; '),
} as const

export async function POST(req: NextRequest) {
  const { key, urls }: Body = await req.json().catch(() => ({}))
  if (!key || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ ok: false, message: 'Missing key or URLs' }, { status: 400 })
  }
  if (urls.length > 50) {
    return NextResponse.json({ ok: false, message: 'Maximum 50 URLs per request' }, { status: 400 })
  }
  if (!sameHost(urls)) {
    return NextResponse.json({ ok: false, message: 'All URLs must share the same host' }, { status: 400 })
  }

  let host: string
  try {
    host = new URL(urls[0]).hostname.toLowerCase()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid URL format' }, { status: 400 })
  }

  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList: urls,
  }

  // Pre-check: Verify key file is reachable and matches key content exactly (trimmed)
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 10000)
    const keyRes = await fetch(payload.keyLocation, { method: 'GET', headers: BROWSER_HEADERS as any, redirect: 'follow', signal: ctrl.signal })
    clearTimeout(timer)
    if (!keyRes.ok) {
      return NextResponse.json({ ok: false, message: `Key file not reachable at ${payload.keyLocation} (status ${keyRes.status})`, detail: { status: keyRes.status } }, { status: 400 })
    }
    const body = (await keyRes.text()).trim()
    if (body !== key.trim()) {
      return NextResponse.json({ ok: false, message: 'Key file content mismatch. The file must contain only the key.', detail: { expected: key.trim(), receivedSample: body.slice(0, 64) } }, { status: 400 })
    }
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError'
    return NextResponse.json({ ok: false, message: `Failed to fetch key file: ${isAbort ? 'request timed out' : (err?.message || 'network error')}` }, { status: 400 })
  }

  try {
    const endpoint = 'https://api.indexnow.org/indexnow'
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 10000)
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    const text = await res.text().catch(() => '')
    const detail = (() => { try { return JSON.parse(text) } catch { return text } })()
    if (!res.ok) {
      return NextResponse.json({ ok: false, message: 'IndexNow request failed', endpoint, detail }, { status: res.status })
    }
    return NextResponse.json({ ok: true, message: `Submitted ${urls.length} URL(s)`, submitted: urls.length, endpoint, detail })
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError'
    return NextResponse.json({ ok: false, message: isAbort ? 'IndexNow request timed out' : (err?.message || 'Network error') }, { status: 500 })
  }
}
