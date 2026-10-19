import { useEffect, useMemo, useState } from 'react'
import { Activity, Layers, Quote, Star, Timer, Users, X, Zap } from 'lucide-react'
import { usePosts, useProjects, useSkills, useTestimonials } from '../lib/hooks'
import { Donut, HBars, Radar, RadialGauge, type BarDatum } from './charts'

const NEON = [
  'var(--neon-1)',
  'var(--neon-2)',
  'var(--neon-3)',
  'var(--neon-4)',
  'var(--neon-5)',
  'var(--neon-6)',
]

const RADAR_LABELS: Record<string, string> = {
  Frontend: 'FRONT',
  Backend: 'BACK',
  Database: 'DATA',
  Mobile: 'MOBILE',
  'Design / UI': 'DESIGN',
  Tools: 'TOOLS',
}

type Vital = { label: string; value: string; Icon: typeof Zap }

function readVitals(): Vital[] {
  const rows: Vital[] = []
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (nav) {
      const ttfb = nav.responseStart - nav.requestStart
      const dcl = nav.domContentLoadedEventEnd - nav.startTime
      rows.push({ label: 'TTFB', value: `${Math.max(0, Math.round(ttfb))} ms`, Icon: Zap })
      rows.push({ label: 'DCL', value: `${Math.max(0, Math.round(dcl))} ms`, Icon: Activity })
    }
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]
    rows.push({
      label: 'FCP',
      value: fcp ? `${Math.round(fcp.startTime)} ms` : '—',
      Icon: Activity,
    })
    const load = nav?.loadEventEnd ? nav.loadEventEnd - nav.startTime : 0
    rows.push({
      label: 'LOAD',
      value: load > 0 ? `${(load / 1000).toFixed(2)} s` : '—',
      Icon: Timer,
    })
  } catch {
    /* performance entries unavailable */
  }
  return rows
}

function KpiCard({
  icon,
  value,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode
  value: string
  label: string
  sub: string
  color: string
}) {
  return (
    <div
      className="neon-card flex items-center gap-4 p-5"
      style={{ ['--card-neon' as string]: color }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-bg"
        style={{ color, boxShadow: `0 0 16px -8px ${color}` }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-2xl leading-none font-bold" style={{ color }}>
          {value}
        </p>
        <p className="label mt-1.5 truncate">{label}</p>
        <p className="truncate font-mono text-[0.62rem] text-mute">{sub}</p>
      </div>
    </div>
  )
}

export default function AnalyticsOverlay({ onClose }: { onClose: () => void }) {
  const { data: projects = [] } = useProjects()
  const { data: testimonials = [] } = useTestimonials()
  const { data: skills = [] } = useSkills()
  const { data: posts = [] } = usePosts()
  const [vitals] = useState<Vital[]>(() => readVitals())

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const m = useMemo(() => {
    const authorRatings = projects.map((p) => p.rating).filter((r): r is number => r != null)
    const authorAvg = authorRatings.length
      ? authorRatings.reduce((s, r) => s + r, 0) / authorRatings.length
      : 0

    const votes = projects.reduce((s, p) => s + p.rating_count, 0)
    const voted = projects.filter((p) => p.rating_count > 0 && p.rating_avg != null)
    const visitorAvg = voted.length
      ? voted.reduce((s, p) => s + (p.rating_avg ?? 0) * p.rating_count, 0) /
        voted.reduce((s, p) => s + p.rating_count, 0)
      : 0

    const tAvg = testimonials.length
      ? testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length
      : 0

    const distribution = [5, 4, 3, 2, 1].map((stars, i) => ({
      label: `${stars}★`,
      value: testimonials.filter((t) => t.rating === stars).length,
      color: NEON[[0, 1, 5, 3, 2][i]],
    }))

    const byCategory = new Map<string, number[]>()
    for (const s of skills) {
      const list = byCategory.get(s.category) ?? []
      list.push(s.proficiency)
      byCategory.set(s.category, list)
    }
    const radar = [...byCategory.entries()].map(([cat, vals]) => ({
      label: RADAR_LABELS[cat] ?? cat.toUpperCase().slice(0, 8),
      value: vals.reduce((a, b) => a + b, 0) / vals.length / 5,
    }))

    const projectBars: BarDatum[] = projects.map((p, i) => ({
      label: p.title,
      value: p.rating ?? p.rating_avg ?? 0,
      display:
        p.rating != null
          ? `${p.rating.toFixed(1)}★ author${p.rating_count > 0 ? ` · ${p.rating_avg?.toFixed(1)} visitor` : ''}`
          : p.rating_count > 0
            ? `${p.rating_avg?.toFixed(1)}★ visitor`
            : 'not rated',
      color: NEON[i % NEON.length],
    }))

    const techCount = new Map<string, number>()
    for (const p of projects) for (const t of p.tech_stack) techCount.set(t, (techCount.get(t) ?? 0) + 1)
    const techBars: BarDatum[] = [...techCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([tech, count], i) => ({
        label: tech,
        value: count,
        display: `${count} project${count > 1 ? 's' : ''}`,
        color: NEON[i % NEON.length],
      }))

    return { authorAvg, votes, visitorAvg, tAvg, distribution, radar, projectBars, techBars }
  }, [projects, testimonials, skills])

  return (
    <div className="palette-overlay" onClick={onClose} role="presentation">
      <div
        className="overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Public analytics dashboard"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-surface/95 px-5 py-4 backdrop-blur-md sm:px-7">
          <div>
            <p className="label">/// ANALYTICS · PUBLIC DASHBOARD</p>
            <h2 className="section-title mt-1 text-lg sm:text-xl">Performance &amp; ratings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close analytics"
            className="brutal-flat flex h-10 w-10 shrink-0 items-center justify-center bg-bg transition-colors hover:text-accent"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-7">
          {/* KPI row */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={<Star size={19} />}
              value={m.authorAvg ? m.authorAvg.toFixed(2) : '—'}
              label="average rating"
              sub={`author · ${projects.length} projects`}
              color="var(--neon-1)"
            />
            <KpiCard
              icon={<Users size={19} />}
              value={m.visitorAvg ? m.visitorAvg.toFixed(2) : '—'}
              label="visitor rating"
              sub={`${m.votes} public vote${m.votes === 1 ? '' : 's'}`}
              color="var(--neon-2)"
            />
            <KpiCard
              icon={<Quote size={19} />}
              value={m.tAvg ? m.tAvg.toFixed(2) : '—'}
              label="testimonial score"
              sub={`${testimonials.length} review${testimonials.length === 1 ? '' : 's'}`}
              color="var(--neon-3)"
            />
            <KpiCard
              icon={<Layers size={19} />}
              value={String(projects.length)}
              label="projects shipped"
              sub={`${posts.length} article${posts.length === 1 ? '' : 's'} written`}
              color="var(--neon-4)"
            />
          </div>

          {/* charts row */}
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            <div className="neon-card flex items-center justify-center p-6" style={{ ['--card-neon' as string]: 'var(--neon-1)' }}>
              <RadialGauge
                value={m.authorAvg}
                label="author score"
                sub={`${projects.length} rated projects`}
                color="var(--neon-1)"
              />
            </div>
            <div className="neon-card flex items-center justify-center p-6" style={{ ['--card-neon' as string]: 'var(--neon-2)' }}>
              <RadialGauge
                value={m.visitorAvg}
                label="visitor score"
                sub={`${m.votes} votes cast`}
                color="var(--neon-2)"
              />
            </div>
            <div className="neon-card flex items-center justify-center p-6" style={{ ['--card-neon' as string]: 'var(--neon-3)' }}>
              <Donut
                segments={m.distribution}
                centerValue={m.tAvg ? m.tAvg.toFixed(1) : '—'}
                centerLabel="avg score"
              />
            </div>
            <div className="neon-card flex items-center justify-center p-6" style={{ ['--card-neon' as string]: 'var(--neon-5)' }}>
              <Radar data={m.radar} color="var(--neon-5)" />
            </div>
          </div>

          {/* bars row */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div
              className="neon-card p-6"
              style={{ ['--card-neon' as string]: 'var(--neon-4)' }}
            >
              <p className="label mb-5">/// RATINGS BY PROJECT</p>
              <HBars data={m.projectBars} max={5} />
            </div>
            <div
              className="neon-card p-6"
              style={{ ['--card-neon' as string]: 'var(--neon-6)' }}
            >
              <p className="label mb-5">/// TOP TECH STACK</p>
              <HBars
                data={m.techBars}
                max={Math.max(1, ...m.techBars.map((b) => b.value))}
                delay={0.2}
              />
            </div>
          </div>

          {/* live vitals */}
          <div
            className="neon-card flex flex-wrap items-center gap-x-6 gap-y-3 p-5"
            style={{ ['--card-neon' as string]: 'var(--neon-1)' }}
          >
            <p className="label">/// LIVE VITALS · YOUR SESSION</p>
            {vitals.map(({ label, value, Icon }) => (
              <span
                key={label}
                className="flex items-center gap-2 font-mono text-xs tracking-widest text-mute"
              >
                <Icon size={13} className="text-accent" />
                {label} <b className="text-ink">{value}</b>
              </span>
            ))}
            <span className="flex items-center gap-2 font-mono text-[0.62rem] tracking-widest text-mute">
              <Activity size={13} className="text-accent" />
              MEASURED LIVE IN YOUR BROWSER
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
