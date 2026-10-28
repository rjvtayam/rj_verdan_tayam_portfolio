import { describe, expect, it } from 'vitest'
import { formatDate, readingTime } from '../format'

describe('formatDate', () => {
  it('formats an ISO date as "Mon DD, YYYY"', () => {
    // midday UTC keeps the calendar date stable across time zones
    expect(formatDate('2024-03-15T12:00:00Z')).toBe('Mar 15, 2024')
  })

  it('returns empty for missing dates', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate('')).toBe('')
  })
})

describe('readingTime', () => {
  const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(' ')

  it('never reports less than one minute', () => {
    expect(readingTime('')).toBe(1)
    expect(readingTime('short note')).toBe(1)
  })

  it('reads prose at ~200 wpm', () => {
    expect(readingTime(words(200))).toBe(1)
    expect(readingTime(words(400))).toBe(2)
  })

  it('counts fenced code lines separately from prose words', () => {
    const code = (lines: number) =>
      ['```python', ...Array.from({ length: lines }, (_, i) => `print(${i})`), '```'].join('\n')
    // 50 code lines ≈ 1 minute on their own; as prose words it would round to 0 → floor 1
    expect(readingTime(code(50))).toBe(1)
    expect(readingTime(code(150))).toBe(3)
  })
})
