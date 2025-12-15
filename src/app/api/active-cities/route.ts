import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

interface CityStat {
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

export async function GET() {
  const supabase = createPublicClient()
  const currentDate = new Date().toISOString()

  const { data, error } = await supabase
    .from('jobs')
    .select('city, expires_at')
    .not('city', 'is', null)
    .or(`expires_at.is.null,expires_at.gte.${currentDate}`)

  if (error) {
    console.error('Error fetching active cities', error)
    return NextResponse.json({ cities: [] }, { status: 500 })
  }

  const cityMap = new Map<string, CityStat>()

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

  const cities = Array.from(cityMap.values()).sort((a, b) => b.count - a.count)

  return NextResponse.json(
    { cities },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    },
  )
}
