import { cache } from 'react'
import type { CountryKey } from '@/data/cityClusters'

// Request-scoped context shared between page and layout components during a single render.
// The page sets the country; the Footer reads it.
interface PageContext {
  countryKey?: CountryKey
}

export const getPageContext = cache((): PageContext => ({}))
