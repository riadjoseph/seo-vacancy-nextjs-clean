import { NextResponse } from 'next/server'

interface BotVisit {
  timestamp: string
  bot_name: string
  bot_type: string
  priority: string
  vendor: string
  ip: string
  page_url: string
  page_title: string
  pathname: string
  referer: string
  country: string
  language: string
  screen_resolution: string
  viewport: string
  response_time: string
  page_size: string
  connection_type: string
  device_memory: string
  cpu_cores: string
  status_code: string
  is_prerendered: string
  client_detected_bot: string
  platform: string
}

export async function GET() {
  try {
    // Get the base URL for your PHP tracker
    const trackerBaseUrl = 'https://wiki.booksparis.com' // Your PHP tracker domain

    // Get today's date in the same format as PHP (Y-m-d)
    const today = new Date().toISOString().split('T')[0]

    // Also get yesterday's data for comparison
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const jsonUrls = [
      `${trackerBaseUrl}/bot_visits_${today}.json`,
      `${trackerBaseUrl}/bot_visits_${yesterday}.json`
    ]

    const statsUrls = [
      `${trackerBaseUrl}/daily_stats_${today}.json`,
      `${trackerBaseUrl}/daily_stats_${yesterday}.json`
    ]

    let allVisits: BotVisit[] = []
    let dailyStats: Record<string, unknown> | null = null

    // Fetch bot visits from the last 2 days
    for (const url of jsonUrls) {
      try {
        const response = await fetch(url, {
          next: { revalidate: 30 } // Cache for 30 seconds
        })

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data)) {
            allVisits = [...allVisits, ...data]
          }
        }
      } catch (error) {
        // Silently continue if a file doesn't exist
        console.warn(`Could not fetch ${url}:`, error)
      }
    }

    // Fetch daily stats
    for (const url of statsUrls) {
      try {
        const response = await fetch(url, {
          next: { revalidate: 30 }
        })

        if (response.ok) {
          dailyStats = await response.json()
          break // Use the first available stats file
        }
      } catch (error) {
        console.warn(`Could not fetch stats from ${url}:`, error)
      }
    }

    // Sort visits by timestamp (newest first)
    allVisits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit to last 500 visits for performance
    allVisits = allVisits.slice(0, 500)

    // Generate some basic stats if daily stats aren't available
    if (!dailyStats && allVisits.length > 0) {
      const todayVisits = allVisits.filter(visit =>
        new Date(visit.timestamp).toDateString() === new Date().toDateString()
      )

      const priorityCounts = allVisits.reduce((acc: Record<string, number>, visit) => {
        acc[visit.priority] = (acc[visit.priority] || 0) + 1
        return acc
      }, {})

      const typeCounts = allVisits.reduce((acc: Record<string, number>, visit) => {
        acc[visit.bot_type] = (acc[visit.bot_type] || 0) + 1
        return acc
      }, {})

      const vendorCounts = allVisits.reduce((acc: Record<string, number>, visit) => {
        acc[visit.vendor || 'Unknown'] = (acc[visit.vendor || 'Unknown'] || 0) + 1
        return acc
      }, {})

      dailyStats = {
        date: today,
        total_visits: allVisits.length,
        today_visits: todayVisits.length,
        by_priority: priorityCounts,
        by_type: typeCounts,
        by_vendor: vendorCounts,
        critical_bots: allVisits.filter(v => v.priority === 'critical').length
      }
    }

    return NextResponse.json({
      success: true,
      visits: allVisits,
      stats: dailyStats,
      lastUpdated: new Date().toISOString(),
      message: `Loaded ${allVisits.length} bot visits`
    })

  } catch (error) {
    console.error('Bot dashboard API error:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch bot data',
      details: error instanceof Error ? error.message : 'Unknown error',
      visits: [],
      stats: null
    }, { status: 500 })
  }
}

// Handle CORS for the dashboard
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}