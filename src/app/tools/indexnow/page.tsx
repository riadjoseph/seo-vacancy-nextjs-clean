import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Breadcrumbs, generateBreadcrumbSchema, type BreadcrumbItem } from '@/components/ui/breadcrumbs'
import { JobCard } from '@/components/JobCard'
import { IndexNowForm } from '@/components/IndexNowForm'
import { createPublicClient } from '@/lib/supabase/public'

export const metadata = {
  title: 'Free IndexNow Tool - Instant URL Submission to Search Engines',
  description: 'Submit URLs instantly to Bing, Yandex, and other IndexNow-enabled search engines. Free tool with built-in key validation and URL processing.',
}

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Tools', href: '/tools' },
  { label: 'IndexNow', href: '/tools/indexnow' },
]

async function getTechnicalSEOJobs() {
  const supabase = createPublicClient()
  const currentDate = new Date().toISOString()

  const { data } = await supabase
    .from('jobs')
    .select('*')
    .contains('tags', ['Technical SEO'])
    .or(`expires_at.is.null,expires_at.gte.${currentDate}`)
    .order('created_at', { ascending: false })
    .limit(6)

  return data || []
}

export default async function IndexNowToolPage() {
  const jobs = await getTechnicalSEOJobs()

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)),
        }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <h1 className="text-3xl font-bold mt-6 mb-4">IndexNow Tool</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Submit URLs to IndexNow-enabled search engines (Bing, Yandex, Seznam, Naver). This tool validates your key file and submits up to 50 URLs at once.
      </p>

      <IndexNowForm />

      {/* Tool features */}
      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-bold">What this tool does</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Built-in safeguards</h3>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>Pre-checks your key file is accessible and matches</li>
                <li>Validates all URLs are well-formed (http/https only)</li>
                <li>Enforces single-host constraint (all URLs must share the same domain)</li>
                <li>Removes duplicates automatically</li>
                <li>Limits to 50 URLs per request (IndexNow best practice)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Privacy first</h3>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li>No logging or storage of your key</li>
                <li>No logging or storage of your URLs</li>
                <li>Direct submission to IndexNow API</li>
                <li>Open source (check the code yourself)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Article */}
      <article className="mt-10 rich-article">
        <h2>What is IndexNow?</h2>
        <p>
          IndexNow is a lightweight, open protocol that lets your site notify participating search engines the moment you add, update, or delete a URL. Instead of waiting for bots to discover changes, you &quot;ping&quot; them—via a simple GET or JSON POST—and they share those URLs across other IndexNow engines. Up to 10,000 URLs per POST are allowed.
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
          <li>Connect via your host&apos;s File Manager or SFTP.</li>
          <li>Navigate to the WordPress root folder (where you see <code>/wp-admin</code>, <code>/wp-content</code>, <code>/wp-includes</code>).</li>
          <li>Upload your file <code>&lt;key&gt;.txt</code> there.</li>
          <li>Confirm it&apos;s live at <code>https://yourdomain.com/&lt;key&gt;.txt</code>.</li>
        </ol>
        <p><strong>Method B (Plugin)</strong></p>
        <ul>
          <li>Install <a href="https://wordpress.org/plugins/indexnow/" className="text-blue-600 hover:underline">IndexNow Plugin</a>.</li>
          <li>Go to Settings → IndexNow, paste your key, Save.</li>
          <li>The plugin auto-generates <code>&lt;key&gt;.txt</code> and submits changes automatically.</li>
        </ul>

        <h3>Next.js (App Router or Pages Router)</h3>
        <ol>
          <li>Place <code>&lt;key&gt;.txt</code> in the <code>/public</code> folder.</li>
          <li>Commit and deploy.</li>
          <li>Verify: <code>https://yourdomain.com/&lt;key&gt;.txt</code></li>
        </ol>

        <h3>Cloudflare Pages</h3>
        <ol>
          <li>Add <code>&lt;key&gt;.txt</code> to your project&apos;s root (or <code>/public</code> if using a framework).</li>
          <li>Push to Git; Cloudflare auto-builds and deploys.</li>
          <li>Check: <code>https://yourdomain.com/&lt;key&gt;.txt</code></li>
        </ol>

        <h3>Shopify</h3>
        <ol>
          <li>In Shopify Admin → <strong>Settings → Files</strong>, upload <code>&lt;key&gt;.txt</code>.</li>
          <li>Shopify hosts it under a CDN path, e.g., <code>https://cdn.shopify.com/s/files/1/1234/5678/files/&lt;key&gt;.txt</code>.</li>
          <li>When calling IndexNow, specify <code>keyLocation</code> with that full CDN path.</li>
        </ol>

        <h3>Magento 2</h3>
        <ol>
          <li>Place <code>&lt;key&gt;.txt</code> in <code>/pub/</code>.</li>
          <li>Deploy static content if needed: <code>bin/magento setup:static-content:deploy</code>.</li>
          <li>Test: <code>https://yourdomain.com/&lt;key&gt;.txt</code></li>
        </ol>

        <h3>PrestaShop</h3>
        <ol>
          <li>Upload <code>&lt;key&gt;.txt</code> to the PrestaShop root (same level as <code>index.php</code>).</li>
          <li>Verify: <code>https://yourdomain.com/&lt;key&gt;.txt</code></li>
        </ol>

        <p><strong>Common requirements:</strong></p>
        <ul>
          <li>HTTP/1.1 200 OK</li>
          <li>Content-Type: text/plain</li>
          <li>Body matches the key exactly (no HTML, no spaces, no quotes)</li>
        </ul>
        <p>If you&apos;re using a subfolder/CDN path (Shopify), include that exact <code>keyLocation</code> in the IndexNow JSON payload.</p>

        <p><strong>Coverage:</strong> With WordPress, Next.js, Cloudflare, Shopify, Magento, and PrestaShop, most CMS/JAMstack setups are covered. Golden rule: a publicly accessible file at <code>/&lt;key&gt;.txt</code> returning only the key value.</p>
      </article>

      {/* Technical SEO Jobs module */}
      {jobs.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Technical SEO Jobs recently posted</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
