'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function GeneralSearchBox() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(currentQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set('q', searchQuery.trim())
      router.push(`/search?${params.toString()}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    // Check if we're on search page
    if (window.location.pathname === '/search') {
      router.push('/search')
    } else {
      // On homepage, just clear the search query state
      const params = new URLSearchParams(searchParams)
      params.delete('q')
      const newUrl = params.toString() ? `/?${params.toString()}` : '/'
      router.push(newUrl)
    }
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search jobs, companies, or use the filters below"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-32 py-3 text-base rounded-lg"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="px-4"
              disabled={!searchQuery.trim()}
            >
              Search
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}