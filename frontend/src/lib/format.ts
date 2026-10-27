export function formatDate(value: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

/** Reading time for a markdown body. Prose reads at ~200 wpm; fenced code is
 *  counted separately (lines are slower to parse) so technical posts don't
 *  collapse to a single minute. */
export function readingTime(contentMd: string): number {
  if (!contentMd) return 1
  const codeBlocks = contentMd.match(/```[\s\S]*?```/g) ?? []
  const codeLines = codeBlocks
    .join('\n')
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('```')).length
  const prose = contentMd.replace(/```[\s\S]*?```/g, ' ')
  const proseWords = prose.split(/\s+/).filter(Boolean).length
  const minutes = proseWords / 200 + codeLines / 50
  return Math.max(1, Math.round(minutes))
}
