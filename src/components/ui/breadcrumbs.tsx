import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center space-x-1 text-sm ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
          )}
          {item.href ? (
            <Link 
              href={item.href} 
              className="text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-muted-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string = '') {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href && { "item": `${baseUrl}${item.href}` })
    }))
  }
}