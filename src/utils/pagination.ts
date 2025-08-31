/**
 * Ghostblock Pagination Utilities
 * Reference: https://audisto.com/guides/pagination/#ghostblock
 */

export interface PaginationRange {
  type: 'page' | 'ellipsis'
  page?: number
  key: string
}

export interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  ranges: PaginationRange[]
}

/**
 * Generate mobile-friendly pagination ranges
 * Mobile pattern: Show first 2 and last 2 pages with ellipsis in between
 * Examples:
 * - Total <= 5: [1, 2, 3, 4, 5]
 * - Total > 5: [1, 2, ..., 8, 9]
 * - Current in middle: [1, 2, ..., 8, 9] (current page indicated by styling)
 */
export function generateGhostblockRanges(
  _currentPage: number,
  totalPages: number
): PaginationRange[] {
  // Safety checks for invalid inputs
  const safeTotalPages = isNaN(totalPages) || totalPages < 1 ? 1 : Math.floor(totalPages)
  
  if (safeTotalPages <= 5) {
    // Show all pages if 5 or fewer (mobile-friendly)
    return Array.from({ length: safeTotalPages }, (_, i) => ({
      type: 'page' as const,
      page: i + 1,
      key: `page-${i + 1}`
    }))
  }

  const ranges: PaginationRange[] = []
  
  // Always show first 2 pages
  ranges.push({ type: 'page', page: 1, key: 'page-1' })
  if (safeTotalPages > 1) {
    ranges.push({ type: 'page', page: 2, key: 'page-2' })
  }
  
  // Add ellipsis if needed
  if (safeTotalPages > 4) {
    ranges.push({ type: 'ellipsis', key: 'ellipsis-middle' })
  }
  
  // Always show last 2 pages (if different from first 2)
  if (safeTotalPages > 3) {
    ranges.push({ type: 'page', page: safeTotalPages - 1, key: `page-${safeTotalPages - 1}` })
  }
  if (safeTotalPages > 2) {
    ranges.push({ type: 'page', page: safeTotalPages, key: `page-${safeTotalPages}` })
  }
  
  return ranges
}

/**
 * Calculate pagination data for a given page and total items
 */
export function calculatePagination(
  currentPage: number,
  totalItems: number,
  itemsPerPage: number = 25
): PaginationData {
  // Ensure we have valid numbers
  const safeCurrentPage = isNaN(currentPage) || currentPage < 1 ? 1 : Math.floor(currentPage)
  const safeTotalItems = isNaN(totalItems) || totalItems < 0 ? 0 : totalItems
  const safeItemsPerPage = isNaN(itemsPerPage) || itemsPerPage < 1 ? 25 : itemsPerPage
  
  const totalPages = safeTotalItems === 0 ? 1 : Math.ceil(safeTotalItems / safeItemsPerPage)
  const validCurrentPage = Math.max(1, Math.min(safeCurrentPage, totalPages))
  
  return {
    currentPage: validCurrentPage,
    totalPages,
    totalItems: safeTotalItems,
    itemsPerPage: safeItemsPerPage,
    hasNextPage: validCurrentPage < totalPages,
    hasPrevPage: validCurrentPage > 1,
    ranges: generateGhostblockRanges(validCurrentPage, totalPages)
  }
}

/**
 * Generate URL with updated page parameter while preserving other query params
 */
export function generatePageUrl(
  currentUrl: string,
  newPage: number,
  searchParams?: URLSearchParams
): string {
  const url = new URL(currentUrl, 'http://localhost:3000')
  
  // Copy existing search params
  if (searchParams) {
    searchParams.forEach((value, key) => {
      if (key !== 'page') {
        url.searchParams.set(key, value)
      }
    })
  }
  
  // Set new page (remove if page 1)
  if (newPage === 1) {
    url.searchParams.delete('page')
  } else {
    url.searchParams.set('page', newPage.toString())
  }
  
  return url.pathname + url.search
}

/**
 * Get pagination cache headers for pages 2-3 (2 days cache)
 */
export function getPaginationCacheHeaders(page: number): Record<string, string> {
  if (page === 2 || page === 3) {
    return {
      'Cache-Control': 'public, max-age=172800, stale-while-revalidate=86400', // 2 days cache, 1 day stale
      'CDN-Cache-Control': 'public, max-age=172800'
    }
  }
  
  return {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=60' // 5 minutes cache for other pages
  }
}