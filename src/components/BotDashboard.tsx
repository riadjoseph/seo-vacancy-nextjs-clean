'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface BotVisit {
  timestamp: string
  bot_name: string
  bot_type: string
  priority: 'critical' | 'high' | 'medium' | 'low'
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

interface DashboardStats {
  totalVisits: number
  todayVisits: number
  criticalBots: number
  topBot: string
  topVendor: string
  topCountry: string
}

interface BotCounts {
  [key: string]: number
}

const BotDashboard = () => {
  const [visits, setVisits] = useState<BotVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalVisits: 0,
    todayVisits: 0,
    criticalBots: 0,
    topBot: '-',
    topVendor: '-',
    topCountry: '-'
  })
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')

  const fetchBotData = async () => {
    try {
      const response = await fetch('/api/bot-dashboard')
      if (!response.ok) throw new Error('Failed to fetch bot data')

      const data = await response.json()
      setVisits(data.visits || [])
      calculateStats(data.visits || [])
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBotData()
    const interval = setInterval(fetchBotData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])  // fetchBotData is defined inside useEffect, so this is fine

  const calculateStats = (visitsData: BotVisit[]) => {
    const today = new Date().toDateString()
    const todayVisits = visitsData.filter(v =>
      new Date(v.timestamp).toDateString() === today
    )

    const criticalBots = visitsData.filter(v => v.priority === 'critical')

    // Count occurrences
    const botCounts: BotCounts = {}
    const vendorCounts: BotCounts = {}
    const countryCounts: BotCounts = {}

    visitsData.forEach(visit => {
      botCounts[visit.bot_name] = (botCounts[visit.bot_name] || 0) + 1
      vendorCounts[visit.vendor] = (vendorCounts[visit.vendor] || 0) + 1
      countryCounts[visit.country] = (countryCounts[visit.country] || 0) + 1
    })

    const topBot = Object.entries(botCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
    const topVendor = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
    const topCountry = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

    setStats({
      totalVisits: visitsData.length,
      todayVisits: todayVisits.length,
      criticalBots: criticalBots.length,
      topBot,
      topVendor,
      topCountry
    })
  }

  const filteredVisits = visits.filter(visit => {
    if (selectedPriority !== 'all' && visit.priority !== selectedPriority) return false
    if (selectedType !== 'all' && visit.bot_type !== selectedType) return false
    return true
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-blue-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    if (type.includes('ai_')) return '🤖'
    if (type === 'search_engine') return '🔍'
    if (type === 'social_media') return '📱'
    if (type === 'seo_tool') return '🎯'
    if (type === 'ecommerce') return '🛒'
    if (type === 'security_scan') return '🔒'
    if (type === 'monitoring') return '📊'
    return '🌐'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fabulous bot data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-500 text-2xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Dashboard Error
            </h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <button
              onClick={fetchBotData}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const uniqueTypes = [...new Set(visits.map(v => v.bot_type))].sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Bot Activity Dashboard
        </h1>
        <p className="text-muted-foreground">
          Almost real-time tracking of AI bots, search engines, and crawlers
        </p>
        <div className="inline-flex items-center gap-2 mt-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live updates every 30 seconds
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalVisits.toLocaleString()}</div>
            <div className="text-sm opacity-90">Total Bot Visits</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.todayVisits.toLocaleString()}</div>
            <div className="text-sm opacity-90">Today&apos;s Visits</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.criticalBots.toLocaleString()}</div>
            <div className="text-sm opacity-90">Critical AI Bots</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-lg font-bold truncate">{stats.topBot}</div>
            <div className="text-sm opacity-90">Top Bot</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="text-lg font-bold truncate">{stats.topVendor}</div>
            <div className="text-sm opacity-90">Top Vendor</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="text-lg font-bold truncate">{stats.topCountry}</div>
            <div className="text-sm opacity-90">Top Country</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Priority:</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="critical">🔥 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Type:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>
                    {getTypeIcon(type)} {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm text-muted-foreground">
              Showing {filteredVisits.length} of {visits.length} visits
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Visits */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Recent Bot Visits</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {filteredVisits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bot visits found with current filters
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredVisits.slice(0, 50).map((visit, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(visit.priority)}`}></div>
                          <span className="font-semibold">{visit.bot_name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getPriorityBadgeColor(visit.priority)}`}>
                            {visit.priority.toUpperCase()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {getTypeIcon(visit.bot_type)} {visit.vendor}
                          </span>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <div className="flex flex-wrap gap-4">
                            <span>📄 {visit.page_title}</span>
                            <span>🌍 {visit.country}</span>
                            <span>📱 {visit.screen_resolution}</span>
                            {visit.response_time !== 'unknown' && (
                              <span>⚡ {visit.response_time}ms</span>
                            )}
                          </div>
                          <div className="mt-1 text-xs">
                            🔗 {visit.page_url}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-sm text-muted-foreground">
                        <div>{new Date(visit.timestamp).toLocaleString()}</div>
                        <div className="text-xs">{visit.ip}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BotDashboard