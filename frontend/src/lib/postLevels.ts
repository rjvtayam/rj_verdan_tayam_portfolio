import { Sprout, Hammer, Zap, type LucideIcon } from 'lucide-react'

/**
 * Difficulty arc for the Writing section: every project note is filed as
 * beginner → intermediate → advanced, mirroring how the system grew.
 */
export type PostLevel = 'beginner' | 'intermediate' | 'advanced'

export type LevelMeta = {
  id: PostLevel
  label: string
  icon: LucideIcon
  color: string
}

export const POST_LEVELS: LevelMeta[] = [
  { id: 'beginner', label: 'BEGINNER', icon: Sprout, color: 'var(--neon-6)' },
  { id: 'intermediate', label: 'INTERMEDIATE', icon: Hammer, color: 'var(--neon-2)' },
  { id: 'advanced', label: 'ADVANCED', icon: Zap, color: 'var(--neon-3)' },
]

const LEVEL_BY_ID = new Map(POST_LEVELS.map((l) => [l.id, l]))

/** Metadata for a stored level value, or null when unclassified. */
export function levelMeta(level: string | null): LevelMeta | null {
  return level ? (LEVEL_BY_ID.get(level as PostLevel) ?? null) : null
}

/** Sort key: beginner first, unclassified last. */
export function levelRank(level: string | null): number {
  const i = POST_LEVELS.findIndex((l) => l.id === level)
  return i === -1 ? POST_LEVELS.length : i
}
