import { describe, expect, it } from 'vitest'
import { categoryForTags, POST_CATEGORIES } from '../postCategories'

describe('categoryForTags', () => {
  it('files single-tag posts', () => {
    expect(categoryForTags(['postgresql']).id).toBe('data')
    expect(categoryForTags(['react']).id).toBe('frontend')
    expect(categoryForTags(['fastapi']).id).toBe('backend')
    expect(categoryForTags(['security']).id).toBe('security')
    expect(categoryForTags(['realtime']).id).toBe('realtime')
    expect(categoryForTags(['ai']).id).toBe('ai')
  })

  it('prefers the most specific topic when tags overlap', () => {
    // security outranks data in the priority order
    expect(categoryForTags(['postgresql', 'security']).id).toBe('security')
    // data outranks frontend
    expect(categoryForTags(['react', 'postgresql']).id).toBe('data')
  })

  it('matches tags case-insensitively', () => {
    expect(categoryForTags(['PostgreSQL']).id).toBe('data')
  })

  it('falls back to data for unmapped or empty tags', () => {
    const fallback = POST_CATEGORIES.find((c) => c.id === 'data')
    expect(categoryForTags([])).toEqual(fallback)
    expect(categoryForTags(['cobol'])).toEqual(fallback)
  })
})
