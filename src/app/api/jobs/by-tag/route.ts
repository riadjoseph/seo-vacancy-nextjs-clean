import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tag = searchParams.get('tag') || undefined
  const city = searchParams.get('city') || undefined
  const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '6', 10) || 6, 24))

  const supabase = await createClient()

  let query = supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(limit)

  if (tag) {
    query = query.contains('tags', [tag]) as unknown as typeof query
  }
  if (city) {
    query = query.eq('city', city)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, items: data || [] })
}
