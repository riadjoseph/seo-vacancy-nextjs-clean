import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tag = searchParams.get('tag') || undefined
  const city = searchParams.get('city') || undefined
  const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '6', 10) || 6, 24))

  const supabase = await createClient()

  // SECURITY: Only select public-safe fields, never expose user_id or internal metadata
  const safeFields = [
    'id',
    'title',
    'company_name',
    'company_logo',
    'description',
    'tags',
    'category',
    'featured',
    'city',
    'salary_min',
    'salary_max',
    'salary_currency',
    'hide_salary',
    'created_at',
    'expires_at',
    'slug',
    'job_url'
  ].join(',')

  let query = supabase.from('jobs').select(safeFields).order('created_at', { ascending: false }).limit(limit)

  // Exclude expired jobs (null expiry or in the future)
  const currentDate = new Date().toISOString()
  query = query.or(`expires_at.is.null,expires_at.gte.${currentDate}`)

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
