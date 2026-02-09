import Link from 'next/link'
import { headers } from 'next/headers'
import { createPublicClient } from '@/lib/supabase/public'
import { SunshineIcon } from '@/components/ui/sunshine-icon'
import { ProductHuntBadge } from '@/components/ProductHuntBadge'
import { createTagSlug } from '@/utils/tagUtils'
import { POPULAR_CITY_CLUSTERS, DEFAULT_POPULAR_CITIES, CITY_LOOKUP, toCityPathSegment } from '@/data/cityClusters'
import type { CountryKey } from '@/data/cityClusters'

// Map Vercel geo country codes to cluster keys
const COUNTRY_CODE_MAP: Record<string, CountryKey> = {
  FR: 'france',
  ES: 'spain',
  BE: 'belgium',
  GB: 'united-kingdom',
  DE: 'germany',
  IT: 'italy',
  NL: 'netherlands',
}

// Detect country from the current page URL
// - /jobs/city/london → look up "london" in CITY_LOOKUP → "united-kingdom"
// - /job/seo-manager-acme-london → last slug segment "london" in CITY_LOOKUP → "united-kingdom"
function detectCountryFromPath(pathname: string): CountryKey | undefined {
  // City listing pages: /jobs/city/[city]
  const cityMatch = pathname.match(/^\/jobs\/city\/([^/?]+)/)
  if (cityMatch) {
    const entry = CITY_LOOKUP[cityMatch[1].toLowerCase()]
    if (entry) return entry.countryKey
  }

  // Job detail pages: /job/[slug] — slug ends with city (title-company-city)
  const jobMatch = pathname.match(/^\/job\/([^/?]+)/)
  if (jobMatch) {
    const parts = jobMatch[1].toLowerCase().split('-')
    // Try last segment, then last two segments (for multi-word cities)
    for (let n = 1; n <= Math.min(3, parts.length - 1); n++) {
      const candidate = parts.slice(-n).join(' ')
      const entry = CITY_LOOKUP[candidate]
      if (entry) return entry.countryKey
    }
  }

  return undefined
}

interface ActiveCityStat {
  normalized: string
  label: string
  count: number
}

function formatCityLabel(city: string): string {
  return city
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

async function getActiveCities(): Promise<ActiveCityStat[]> {
  const supabase = createPublicClient()
  const currentDate = new Date().toISOString()

  const { data, error } = await supabase
    .from('jobs')
    .select('city, expires_at')
    .not('city', 'is', null)
    .or(`expires_at.is.null,expires_at.gte.${currentDate}`)

  if (error) {
    console.error('Error fetching active cities', error)
    return []
  }

  const cityMap = new Map<string, ActiveCityStat>()

  data?.forEach((job) => {
    const rawCity = job.city?.trim()
    if (!rawCity) return

    const normalized = rawCity.toLowerCase()
    const existing = cityMap.get(normalized)

    if (existing) {
      existing.count += 1
    } else {
      cityMap.set(normalized, {
        normalized,
        label: formatCityLabel(rawCity),
        count: 1,
      })
    }
  })

  return Array.from(cityMap.values()).sort((a, b) => b.count - a.count)
}

export async function Footer() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  // Priority: page context (URL) → geo header → defaults
  const countryFromPath = detectCountryFromPath(pathname)
  const countryCode = headersList.get('x-vercel-ip-country') ?? undefined
  const countryKey = countryFromPath ?? (countryCode ? COUNTRY_CODE_MAP[countryCode] : undefined)

  const cluster = countryKey ? POPULAR_CITY_CLUSTERS[countryKey] : undefined
  const footerHeading = cluster ? `Popular Cities in ${cluster.country}` : 'Popular Cities'

  const activeCityStats = await getActiveCities()
  const activeSet = new Set(activeCityStats.map((s) => s.normalized))

  const candidateCities = cluster ? cluster.cities : Array.from(DEFAULT_POPULAR_CITIES)
  const fallbackLimit = candidateCities.length || DEFAULT_POPULAR_CITIES.length

  const filteredCities = candidateCities
    .filter((cityName) => activeSet.has(toCityPathSegment(cityName)))
    .map((cityName) => ({
      label: cityName,
      slug: toCityPathSegment(cityName),
    }))

  let cityLinks: { label: string; slug: string }[] = filteredCities

  if (cityLinks.length === 0) {
    cityLinks = activeCityStats.slice(0, fallbackLimit).map((stat) => ({
      label: stat.label,
      slug: stat.normalized,
    }))
  }

  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-secondary-foreground mb-4">
              <SunshineIcon className="h-6 w-6 text-yellow-400" />
              <span>SEO & GEO Jobs Europe</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Find your next SEO and tech career opportunity across Europe.
            </p>
            <ProductHuntBadge />
          </div>

          <div>
            <h3 className="font-semibold text-secondary-foreground mb-4">Specializations</h3>
            <ul className="space-y-2 text-sm">
              {[
                'SEO Strategy & Management',
                'Technical SEO',
                'Enterprise SEO',
                'Analytics & Data SEO',
                'Local SEO',
              ].map((label) => (
                <li key={label}>
                  <Link href={`/tag/${createTagSlug(label)}`} className="hover:text-secondary-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-secondary-foreground mb-4">{footerHeading}</h3>
            {cityLinks.length === 0 && (
              <p className="text-sm text-muted-foreground">New cities coming soon.</p>
            )}
            {cityLinks.length > 0 && (
              <ul className="space-y-2 text-sm">
                {cityLinks.map((city) => (
                  <li key={city.slug}>
                    <Link
                      href={`/jobs/city/${city.slug}`}
                      className="hover:text-secondary-foreground"
                    >
                      {city.label} SEO Jobs
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-secondary-foreground mb-4">Service</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-secondary-foreground">Blog</Link></li>
              <li><Link href="/tools" className="hover:text-secondary-foreground">Tools</Link></li>
              <li><Link href="/auth/magic-link" className="hover:text-secondary-foreground">Post a Job</Link></li>
              <li><Link href="/about" className="hover:text-secondary-foreground">About</Link></li>
              <li><Link href="/contact" className="hover:text-secondary-foreground">Contact</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-secondary-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-secondary-foreground">Terms of Service</Link></li>
              <li><Link href="/llms.txt" className="hover:text-secondary-foreground">LLMs Policy</Link></li>
              <li><a href="https://buymeacoffee.com/riadjoseph" target="_blank" className="hover:text-secondary-foreground">Buy Me a Coffee</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SEO & GEO Jobs Europe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
