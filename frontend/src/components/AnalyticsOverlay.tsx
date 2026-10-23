import { useMemo, useState } from 'react'
import { Activity, Layers, Quote, Star, Timer, Users, Zap } from 'lucide-react'
import { usePosts, useProjects, useSkills, useTestimonials } from '../lib/hooks'
import OverlayShell from './OverlayShell'
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
      className="neon-card flex items-start gap-3 p-4 sm:items-center sm:gap-4 sm:p-5"
      style={{ ['--card-neon' as string]: color }}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-bg sm:h-11 sm:w-11"
        style={{ color, boxShadow: `0 0 16px -8px ${color}` }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="font-mono text-xl leading-none font-bold tabular-nums sm:text-2xl"
          style={{ color }}
        >
          {value}
        </p>
        <p className="label mt-1.5 leading-snug">{label}</p>
        <p className="mt-0.5 truncate font-mono text-[0.58rem] text-mute sm:text-[0.62rem]">{sub}</p>
      </div>
    </div>
  )
}

function ChartCard({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      className="neon-card flex min-w-0 items-center justify-center p-5 sm:p-6"
      style={{ ['--card-neon' as string]: color }}
    >
      {children}
    </div>
  )
}

export default function AnalyticsOverlay({ onClose }: { onClose: () => void }) {
  const { data: projects = [] } = useProjects()
  const { data: testimonials = [] } = useTestimonials()
  const { data: skills = [] } = useSkills()
  const { data: posts = [] } = usePosts()
  const [vitals] = useState<Vital[]>(() => readVitals())

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

  const totalReviewVotes = m.distribution.reduce((s, d) => s + d.value, 0)

  return (
    <OverlayShell
      onClose={onClose}
      label="/// ANALYTICS · PUBLIC DASHBOARD"
      title="Performance & ratings"
      ariaLabel="Public analytics dashboard"
      actions={
        <span className="brutal-flat hidden items-center gap-2 bg-bg px-3 py-2 font-mono text-[0.62rem] tracking-widest text-mute sm:inline-flex">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
          LIVE DATA
        </span>
      }
    >
      <div className="space-y-5 sm:space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          <KpiCard
            icon={<Star size={19} />}
            value={m.authorAvg ? m.authorAvg.toFixed(2) : '0.00'}
            label="average rating"
            sub={`author · ${projects.length} projects`}
            color="var(--neon-1)"
          />
          <KpiCard
            icon={<Users size={19} />}
            value={m.visitorAvg ? m.visitorAvg.toFixed(2) : '0.0'}
            label="visitor rating"
            sub={
              m.votes > 0
                ? `${m.votes} public vote${m.votes === 1 ? '' : 's'}`
                : 'awaiting first vote'
            }
            color="var(--neon-2)"
          />
          <KpiCard
            icon={<Quote size={19} />}
            value={m.tAvg ? m.tAvg.toFixed(2) : '0.00'}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ChartCard color="var(--neon-1)">
            <RadialGauge
              value={m.authorAvg}
              label="author score"
              sub={`${projects.length} rated projects`}
              color="var(--neon-1)"
            />
          </ChartCard>
          <ChartCard color="var(--neon-2)">
            <RadialGauge
              value={m.visitorAvg}
              label="visitor score"
              sub={`${m.votes} vote${m.votes === 1 ? '' : 's'} cast`}
              color="var(--neon-2)"
            />
          </ChartCard>
          <ChartCard color="var(--neon-3)">
            <Donut
              segments={m.distribution}
              centerValue={totalReviewVotes > 0 ? m.tAvg.toFixed(1) : '0.0'}
              centerLabel="avg score"
            />
          </ChartCard>
          <ChartCard color="var(--neon-5)">
            <Radar data={m.radar} color="var(--neon-5)" />
          </ChartCard>
        </div>

        {/* bars row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div
            className="neon-card min-w-0 p-5 sm:p-6"
            style={{ ['--card-neon' as string]: 'var(--neon-4)' }}
          >
            <p className="label mb-5">/// RATINGS BY PROJECT</p>
            <HBars data={m.projectBars} max={5} />
          </div>
          <div
            className="neon-card min-w-0 p-5 sm:p-6"
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
          className="neon-card p-5 sm:p-6"
          style={{ ['--card-neon' as string]: 'var(--neon-1)' }}
        >
          <p className="label mb-4">/// LIVE VITALS · YOUR SESSION</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {vitals.map(({ label, value, Icon }) => (
              <div key={label} className="rounded-xl border border-line bg-bg px-3.5 py-3">
                <p className="flex items-center gap-1.5 font-mono text-[0.58rem] tracking-widest text-mute">
                  <Icon size={11} className="text-accent" />
                  {label}
                </p>
                <p className="mt-1 font-mono text-sm font-bold tabular-nums">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 font-mono text-[0.58rem] tracking-widest text-mute">
            <Activity size={11} className="text-accent" />
            MEASURED LIVE IN YOUR BROWSER
          </p>
        </div>
      </div>
    </OverlayShell>
  )
}
