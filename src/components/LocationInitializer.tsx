'use client'

import { useEffect } from 'react'
import { useLocationSetter } from '@/lib/location-context'
import { CITY_LOOKUP } from '@/data/cityClusters'

interface LocationInitializerProps {
  city?: string | null
}

export function LocationInitializer({ city }: LocationInitializerProps) {
  const setLocation = useLocationSetter()

  useEffect(() => {
    const normalized = city?.trim().toLowerCase()
    if (normalized && CITY_LOOKUP[normalized]) {
      const entry = CITY_LOOKUP[normalized]
      setLocation({ city: entry.city, countryKey: entry.countryKey })
    } else {
      setLocation({})
    }

    return () => {
      setLocation({})
    }
  }, [city, setLocation])

  return null
}
