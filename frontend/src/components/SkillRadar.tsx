import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { Skill } from '../lib/types'

type Props = {
  skills: Skill[]
  size?: number
}

export default function SkillRadar({ skills, size = 340 }: Props) {
  const categories = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>()
    for (const skill of skills) {
      const entry = map.get(skill.category) ?? { total: 0, count: 0 }
      entry.total += skill.proficiency
      entry.count += 1
      map.set(skill.category, entry)
    }
    return [...map.entries()].map(([name, v]) => ({ name, value: v.total / v.count }))
  }, [skills])

  if (categories.length < 3) return null

  const c = size / 2
  const radius = size * 0.34
  const pointAt = (index: number, ratio: number): [number, number] => {
    const angle = (Math.PI * 2 * index) / categories.length - Math.PI / 2
    return [c + Math.cos(angle) * radius * ratio, c + Math.sin(angle) * radius * ratio]
  }
  const polygon = categories
    .map((cat, i) => pointAt(i, cat.value / 5).join(','))
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto block w-full max-w-[340px]"
      role="img"
      aria-label="Skill categories radar chart"
    >
      {[1, 0.8, 0.6, 0.4, 0.2].map((ratio) => (
        <polygon
          key={ratio}
          points={categories
            .map((_, i) => pointAt(i, ratio).join(','))
            .join(' ')}
          fill="none"
          stroke="var(--line-soft)"
          strokeWidth={1}
        />
      ))}
      {categories.map((cat, i) => {
        const [x, y] = pointAt(i, 1)
        const [lx, ly] = pointAt(i, 1.28)
        return (
          <g key={cat.name}>
            <line x1={c} y1={c} x2={x} y2={y} stroke="var(--line-soft)" strokeWidth={1} />
            <text
              x={lx}
              y={ly}
              textAnchor={lx > c + 6 ? 'start' : lx < c - 6 ? 'end' : 'middle'}
              dominantBaseline="middle"
              className="fill-muted"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em' }}
            >
              {cat.name.toUpperCase()}
            </text>
          </g>
        )
      })}
      <motion.polygon
        points={polygon}
        fill="color-mix(in srgb, var(--accent) 22%, transparent)"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${c}px ${c}px` }}
      />
      {categories.map((cat, i) => {
        const [x, y] = pointAt(i, cat.value / 5)
        return <circle key={cat.name} cx={x} cy={y} r={3.5} fill="var(--accent)" />
      })}
    </svg>
  )
}
