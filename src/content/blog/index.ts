import hreflang from './hreflang-truth'
import howto from './how-to-use-seo-vacancy'
import type { BlogPost } from '@/types/blog'

export const allPosts: BlogPost[] = [
  howto,
  hreflang,
]

export const findPostBySlug = (slug: string) => allPosts.find(p => p.slug === slug) || null
