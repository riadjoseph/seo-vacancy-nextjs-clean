export type JobListModule = {
  type: 'jobList'
  title?: string
  tag?: string
  city?: string
  limit?: number
}

export type BlogModule = JobListModule

export interface BlogPost {
  slug: string
  title: string
  summary?: string
  date: string
  content: string
  modules?: BlogModule[]
  authorName?: string
}
