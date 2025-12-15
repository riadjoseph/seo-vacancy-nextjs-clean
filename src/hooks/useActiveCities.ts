'use client'

import { useEffect, useMemo, useState } from 'react'

export interface ActiveCityStat {
  normalized: string
  label: string
  count: number
}

interface ActiveCityState {
  stats: ActiveCityStat[]
  loading: boolean
}

let cachedStats: ActiveCityStat[] | null = null
let inflightRequest: Promise<ActiveCityStat[]> | null = null

async function fetchActiveCityStats(): Promise<ActiveCityStat[]> {
  const response = await fetch('/api/active-cities')
  if (!response.ok) {
    throw new Error('Failed to fetch active cities')
  }

  const payload = (await response.json()) as { cities?: ActiveCityStat[] }
  const stats = payload.cities ?? []
  cachedStats = stats
  return stats
}

export function useActiveCities(): ActiveCityState & { activeSet: Set<string> } {
  const [state, setState] = useState<ActiveCityState>({
    stats: cachedStats ?? [],
    loading: !cachedStats,
  })

  useEffect(() => {
    if (cachedStats) {
      setState({ stats: cachedStats, loading: false })
      return
    }

    if (!inflightRequest) {
      inflightRequest = fetchActiveCityStats().finally(() => {
        inflightRequest = null
      })
    }

    inflightRequest
      ?.then((stats) => {
        setState({ stats, loading: false })
      })
      .catch((error) => {
        console.error('Unable to load active cities', error)
        setState({ stats: [], loading: false })
      })
  }, [])

  const activeSet = useMemo(() => new Set(state.stats.map((stat) => stat.normalized)), [state.stats])

  return { ...state, activeSet }
}
