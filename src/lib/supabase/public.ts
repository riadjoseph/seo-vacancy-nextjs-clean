import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Public Supabase client - no cookies, no auth
// Use this for pages that should be static (job pages, listings, etc.)
// This allows Next.js to cache pages and serve them as static HTML
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
