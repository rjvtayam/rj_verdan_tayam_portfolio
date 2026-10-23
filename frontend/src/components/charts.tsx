import { motion } from 'framer-motion'
import CountUp from './CountUp'

const EASE = [0.22, 1, 0.36, 1] as const

/* ---------- radial gauge (animated arc) ---------- */

type GaugeProps = {
  value: number
  max?: number
  label: string
  sub?: string
  color?: string
  size?: number
  decimals?: number
}

export function RadialGauge({
  value,
  max = 5,
  label,
  sub,
  color = 'var(--accent)',
  size = 172,
  decimals = 1,
}: GaugeProps) {
  const stroke = 11
  const r = (size - stroke) / 2
  const frac = Math.max(0, Math.min(1, max === 0 ? 0 : value / max))
  const c = size / 2

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="relative w-full" style={{ maxWidth: size, aspectRatio: '1 / 1' }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="h-full w-full"
          aria-hidden="true"
        >
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="var(--line-soft)"
            strokeWidth={1}
            strokeDasharray="2 6"
          />
          <motion.circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: frac }}
            transition={{ duration: 1.25, ease: EASE, delay: 0.15 }}
            transform={`rotate(-90 ${c} ${c})`}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          <span className="font-mono text-[1.5rem] leading-none font-bold tabular-nums sm:text-[1.75rem]" style={{ color }}>
            <CountUp value={value} decimals={decimals} />
            <span className="text-sm text-mute">/{max}</span>
          </span>
          {sub && (
            <span className="mt-1.5 text-center font-mono text-[0.58rem] tracking-widest text-mute">
              {sub}
            </span>
          )}
        </div>
      </div>
      <p className="label text-center">{label}</p>
    </div>
  )
}

/* ---------- horizontal neon bars ---------- */

export type BarDatum = { label: string; value: number; display: string; color?: string }

export function HBars({ data, max = 5, delay = 0.15 }: { data: BarDatum[]; max?: number; delay?: number }) {
  if (data.length === 0) {
    return <p className="font-mono text-sm text-mute">no data yet.</p>
  }
  return (
    <ul className="space-y-4">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate font-mono text-xs font-bold tracking-wide">{d.label}</span>
            <span className="shrink-0 font-mono text-[0.68rem] text-mute">{d.display}</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full border border-line bg-surface-2">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: d.color ?? 'var(--accent)',
                boxShadow: `0 0 8px -2px ${d.color ?? 'var(--accent)'}`,
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${max === 0 ? 0 : Math.max(0, Math.min(100, (d.value / max) * 100))}%` }}
              transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.07 }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ---------- donut (rating distribution) ---------- */

export type Segment = { label: string; value: number; color: string }

export function Donut({
  segments,
  size = 178,
  thickness = 15,
  centerValue,
  centerLabel,
}: {
  segments: Segment[]
  size?: number
  thickness?: number
  centerValue: string
  centerLabel: string
}) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const arcs = segments.map((s, i) => {
    const frac = total === 0 ? 0 : s.value / total
    const start =
      total === 0
        ? 0
        : segments.slice(0, i).reduce((acc, prev) => acc + prev.value / total, 0)
    return { ...s, start, frac }
  })
  const r = (size - thickness) / 2
  const c = size / 2

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="relative w-full" style={{ maxWidth: size, aspectRatio: '1 / 1' }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" aria-hidden="true">
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--line)" strokeWidth={thickness} opacity={0.4} />
          {arcs.map(
            (a, i) =>
              a.value > 0 && (
                <motion.circle
                  key={a.label}
                  cx={c}
                  cy={c}
                  r={r}
                  fill="none"
                  stroke={a.color}
                  strokeWidth={thickness}
                  strokeDashoffset={-a.start}
                  initial={{ strokeDasharray: '0 1' }}
                  animate={{ strokeDasharray: `${Math.max(a.frac - 0.01, 0.001)} 1` }}
                  transition={{ duration: 0.85, ease: EASE, delay: 0.2 + i * 0.14 }}
                  transform={`rotate(-90 ${c} ${c})`}
                  style={{ filter: `drop-shadow(0 0 5px ${a.color})` }}
                />
              ),
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold tabular-nums text-accent sm:text-2xl">
            {centerValue}
          </span>
          <span className="mt-1 text-center font-mono text-[0.56rem] tracking-widest text-mute uppercase">
            {centerLabel}
          </span>
        </div>
      </div>
      <ul className="flex max-w-full flex-wrap justify-center gap-x-3 gap-y-1.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-1.5 font-mono text-[0.62rem] text-mute">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
            />
            {s.label} · {s.value}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- hexagonal radar (skill categories) ---------- */

export function Radar({
  data,
  size = 270,
  color = 'var(--accent)',
}: {
  data: { label: string; value: number }[]
  size?: number
  color?: string
}) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 58
  const n = Math.max(data.length, 3)

  const point = (i: number, scale: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [cx + Math.cos(angle) * r * scale, cy + Math.sin(angle) * r * scale] as const
  }

  const polygon = (scale: number) =>
    Array.from({ length: n }, (_, i) => point(i, scale).join(',')).join(' ')

  const dataPolygon = Array.from({ length: n }, (_, i) => {
    const v = Math.max(0, Math.min(1, data[i]?.value ?? 0))
    return point(i, v).join(',')
  }).join(' ')

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full"
        style={{ maxWidth: size }}
        aria-hidden="true"
      >
        {[0.25, 0.5, 0.75, 1].map((s) => (
          <polygon
            key={s}
            points={polygon(s)}
            fill="none"
            stroke="var(--line)"
            strokeWidth={s === 1 ? 1.2 : 0.8}
            opacity={s === 1 ? 1 : 0.6}
          />
        ))}
        {Array.from({ length: n }, (_, i) => {
          const [x, y] = point(i, 1)
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth={0.8} opacity={0.7} />
        })}
        <motion.g
          initial={{ opacity: 0, scale: 0.15 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
          style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: 'view-box' }}
        >
          <polygon
            points={dataPolygon}
            fill={color}
            fillOpacity={0.18}
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 7px ${color})` }}
          />
          {data.map((d, i) => {
            const [x, y] = point(i, Math.max(0, Math.min(1, d.value)))
            return <circle key={d.label} cx={x} cy={y} r={3.2} fill={color} />
          })}
        </motion.g>
        {data.map((d, i) => {
          const [x, y] = point(i, 1.16)
          const anchor = Math.abs(x - cx) < 6 ? 'middle' : x > cx ? 'start' : 'end'
          return (
            <text
              key={d.label}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="var(--muted)"
              fontSize="9"
              fontFamily="var(--font-mono)"
              letterSpacing="0.8"
            >
              {d.label.toUpperCase()}
            </text>
          )
        })}
      </svg>
      <p className="label">proficiency · 0–5 scale</p>
    </div>
  )
}
