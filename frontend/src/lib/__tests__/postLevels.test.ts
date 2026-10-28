import { describe, expect, it } from 'vitest'
import { levelMeta, levelRank, POST_LEVELS } from '../postLevels'

describe('POST_LEVELS', () => {
  it('defines the three-level arc in order', () => {
    expect(POST_LEVELS.map((l) => l.id)).toEqual(['beginner', 'intermediate', 'advanced'])
  })
})

describe('levelMeta', () => {
  it('resolves known levels', () => {
    expect(levelMeta('beginner')?.label).toBe('BEGINNER')
    expect(levelMeta('advanced')?.icon).toBe(POST_LEVELS[2].icon)
  })

  it('returns null for unknown or missing levels', () => {
    expect(levelMeta('expert')).toBeNull()
    expect(levelMeta(null)).toBeNull()
  })
})

describe('levelRank', () => {
  it('orders beginner → intermediate → advanced, unknown last', () => {
    expect(levelRank('beginner')).toBeLessThan(levelRank('intermediate'))
    expect(levelRank('intermediate')).toBeLessThan(levelRank('advanced'))
    expect(levelRank('expert')).toBe(POST_LEVELS.length)
    expect(levelRank(null)).toBe(POST_LEVELS.length)
  })
})
