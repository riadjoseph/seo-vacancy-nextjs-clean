'use client'

import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import type { CountryKey } from '@/data/cityClusters'

interface LocationState {
  city?: string
  countryKey?: CountryKey
}

interface LocationContextValue {
  location: LocationState
  setLocation: (state: LocationState) => void
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<LocationState>({})

  const setLocation = useCallback((state: LocationState) => {
    setLocationState(state)
  }, [])

  const value = useMemo<LocationContextValue>(
    () => ({ location, setLocation }),
    [location, setLocation],
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

function useLocationContext() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider')
  }
  return context
}

export function useCurrentLocation() {
  return useLocationContext().location
}

export function useLocationSetter() {
  return useLocationContext().setLocation
}
