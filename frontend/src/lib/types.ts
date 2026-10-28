export interface Tag {
  id: number
  name: string
}

export interface Project {
  id: number
  slug: string
  title: string
  summary: string
  problem: string
  approach: string
  results: { label: string; value: string }[]
  tech_stack: string[]
  repo_url: string | null
  demo_url: string | null
  demo_video: string | null
  cover_image: string | null
  featured: boolean
  rating: number | null
  rating_avg: number | null
  rating_count: number
  status: string
  created_at: string
  tags: Tag[]
}

export interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  /** Detail responses only — list endpoints return a slim payload. */
  content_md?: string
  /** List responses only — precomputed from content_md server-side. */
  reading_minutes?: number
  tags: string[]
  project_slug: string | null
  level: string | null
  status: string
  published_at: string | null
  created_at: string
}

export interface Skill {
  id: number
  name: string
  category: string
  proficiency: number
  icon: string | null
  order: number
}

export interface Experience {
  id: number
  company: string
  role: string
  start_date: string
  end_date: string | null
  bullets: string[]
  order: number
}

export interface Message {
  id: number
  name: string
  email: string
  subject: string
  body: string
  is_read: boolean
  created_at: string
}

export interface AdminStats {
  projects: number
  published_projects: number
  posts: number
  unread_messages: number
  messages: number
  skills: number
  testimonials: number
}

export interface Testimonial {
  id: number
  name: string
  role: string
  quote: string
  rating: number
  avatar_url: string | null
  status: string
  created_at: string
}

export type TestimonialInput = Pick<Testimonial, 'name' | 'role' | 'quote' | 'rating'>

export interface VoteResult {
  rating_avg: number
  rating_count: number
  my_vote: number | null
}

export interface User {
  id: number
  email: string
  role: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  role: string
}

export type ProjectInput = Partial<Omit<Project, 'id' | 'created_at' | 'tags'>> & {
  tags?: string[]
}

export type PostInput = Partial<Omit<Post, 'id' | 'created_at'>> & { tags?: string[] }

export type SkillInput = Omit<Skill, 'id' | 'icon'> & { icon?: string | null }

export type ExperienceInput = Omit<Experience, 'id'>
