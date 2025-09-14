import hreflang from './hreflang-truth'
import type { BlogPost } from '@/types/blog'

export const allPosts: BlogPost[] = [
  hreflang,
]

export const findPostBySlug = (slug: string) => allPosts.find(p => p.slug === slug) || null
