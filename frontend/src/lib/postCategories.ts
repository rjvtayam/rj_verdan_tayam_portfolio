import {
  Database,
  Atom,
  Server,
  ShieldCheck,
  Sparkles,
  RefreshCcw,
  type LucideIcon,
} from 'lucide-react'

/**
 * Curated topic categories for the Writing section. A post is matched to a
 * category via CATEGORY_PRIORITY (most specific topic first), so a post tagged
 * ["postgresql", "security"] files under Security, not Data.
 */
export type PostCategory = {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

export const POST_CATEGORIES: PostCategory[] = [
  { id: 'security', label: 'Security', icon: ShieldCheck, color: 'var(--neon-3)' },
  { id: 'realtime', label: 'Realtime', icon: RefreshCcw, color: 'var(--neon-5)' },
  { id: 'ai', label: 'AI', icon: Sparkles, color: 'var(--neon-1)' },
  { id: 'data', label: 'Data', icon: Database, color: 'var(--neon-2)' },
  { id: 'backend', label: 'Backend', icon: Server, color: 'var(--neon-4)' },
  { id: 'frontend', label: 'Frontend', icon: Atom, color: 'var(--neon-6)' },
]

/** Most-specific topic first: a post claims the earliest matching category. */
const CATEGORY_PRIORITY = ['security', 'realtime', 'ai', 'data', 'backend', 'frontend']

/** Map every tag that appears in seed data to a category id. */
const TAG_TO_CATEGORY: Record<string, string> = {
  // data
  postgresql: 'data',
  mysql: 'data',
  mongodb: 'data',
  performance: 'data',
  // frontend
  react: 'frontend',
  typescript: 'frontend',
  css: 'frontend',
  responsive: 'frontend',
  ux: 'frontend',
  product: 'frontend',
  // backend
  fastapi: 'backend',
  flask: 'backend',
  python: 'backend',
  architecture: 'backend',
  // security
  security: 'security',
  // realtime
  realtime: 'realtime',
  // ai
  ai: 'ai',
}

const BY_ID = new Map(POST_CATEGORIES.map((c) => [c.id, c]))
const FALLBACK: PostCategory = BY_ID.get('data')!

export function categoryForTags(tags: string[]): PostCategory {
  const lower = tags.map((t) => t.toLowerCase())
  for (const id of CATEGORY_PRIORITY) {
    if (lower.some((t) => TAG_TO_CATEGORY[t] === id)) {
      const found = BY_ID.get(id)
      if (found) return found
    }
  }
  return FALLBACK
}
