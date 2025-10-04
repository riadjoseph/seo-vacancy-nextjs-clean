'use client'

import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

// Lazy load ReactMarkdown to reduce initial bundle size
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  loading: () => <div className="animate-pulse bg-muted/20 rounded min-h-[2em]" />,
  ssr: true // Keep SSR for SEO
})

export type LazyMarkdownProps = ComponentProps<typeof ReactMarkdown>

export function LazyMarkdown(props: LazyMarkdownProps) {
  return <ReactMarkdown {...props} />
}
