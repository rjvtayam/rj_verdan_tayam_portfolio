import { describe, expect, it } from 'vitest'
import { parseStat, resultIcon, statFrame } from '../resultStats'

describe('parseStat', () => {
  it('parses a plain integer', () => {
    expect(parseStat('15')).toEqual({
      kind: 'count',
      numerator: 15,
      denominator: null,
      startText: '0',
    })
  })

  it('parses a "numerator/denominator" pair', () => {
    expect(parseStat('15/20')).toEqual({
      kind: 'count',
      numerator: 15,
      denominator: 20,
      startText: '0/20',
    })
  })

  it('treats non-numeric values as literal text', () => {
    expect(parseStat('SF9 + SF10')).toEqual({ kind: 'text', text: 'SF9 + SF10' })
    expect(parseStat('Socket.IO')).toEqual({ kind: 'text', text: 'Socket.IO' })
  })

  it('does not count decimals or negatives as numeric', () => {
    expect(parseStat('99.9').kind).toBe('text')
    expect(parseStat('-5').kind).toBe('text')
  })
})

describe('statFrame', () => {
  it('starts at zero and lands exactly on the value', () => {
    const stat = parseStat('15')
    if (stat.kind !== 'count') throw new Error('expected a countable stat')
    expect(statFrame(stat, 0)).toBe('0')
    expect(statFrame(stat, 1)).toBe('15')
    // ease-out cubic: 15 * (1 - 0.5^3) = 13.125 → 13
    expect(statFrame(stat, 0.5)).toBe('13')
  })

  it('keeps the "/denominator" visible through the animation', () => {
    const stat = parseStat('10/15')
    if (stat.kind !== 'count') throw new Error('expected a countable stat')
    expect(statFrame(stat, 0)).toBe('0/0')
    expect(statFrame(stat, 1)).toBe('10/15')
  })

  it('clamps out-of-range progress', () => {
    const stat = parseStat('10/10')
    if (stat.kind !== 'count') throw new Error('expected a countable stat')
    expect(statFrame(stat, -1)).toBe('0/0')
    expect(statFrame(stat, 2)).toBe('10/10')
  })
})

describe('resultIcon', () => {
  it('maps keywords to the expected icon', () => {
    expect(resultIcon('Backend tests passing')).not.toBe(resultIcon('Lint + type errors'))
  })

  it('falls back to the generic bar chart for unknown labels', () => {
    // the fallback is BarChart3; compare against a label that maps to it explicitly
    expect(resultIcon('Some entirely novel metric')).toBe(resultIcon('Page views'))
  })

  it('is case-insensitive', () => {
    expect(resultIcon('SECURITY middleware')).toBe(resultIcon('security middleware'))
  })
})
