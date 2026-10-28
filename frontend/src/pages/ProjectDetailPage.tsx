import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Bug,
  Building2,
  CalendarDays,
  Database,
  ExternalLink,
  FileText,
  Flag,
  FlaskConical,
  GitBranch,
  LayoutGrid,
  Percent,
  Play,
  Radio,
  Trophy,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import { GithubIcon } from '../components/SocialIcons'
import { Link, useParams } from 'react-router-dom'
import Reveal from '../components/Reveal'
import StarRating from '../components/StarRating'
import VoteWidget from '../components/VoteWidget'
import { usePosts, useProject, useProjects } from '../lib/hooks'
import { techColor } from '../lib/techColors'
import { levelMeta, levelRank } from '../lib/postLevels'

const NEON = ['var(--neon-1)', 'var(--neon-2)', 'var(--neon-3)', 'var(--neon-4)', 'var(--neon-5)', 'var(--neon-6)']

/** Plain integers and "15/15"-style pairs count up; anything else renders as-is. */
const NUMERIC = /^(\d+)(?:\/(\d+))?$/
const COUNT_MS = 900

/**
 * Counts a numeric stat up when it scrolls into view (IntersectionObserver +
 * rAF, runs once). Non-numeric values — "SF9 + SF10", "Socket.IO" — and
 * prefers-reduced-motion render the final text immediately.
 */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [text, setText] = useState(() => {
    const m = NUMERIC.exec(value)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return m && !reduced ? (m[2] !== undefined ? `0/${m[2]}` : '0') : value
  })

  useEffect(() => {
    const el = ref.current
    const m = NUMERIC.exec(value)
    if (!el || !m || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const end1 = Number(m[1])
    const end2 = m[2] !== undefined ? Number(m[2]) : null
    let raf = 0
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        const started = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - started) / COUNT_MS)
          const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
          const n1 = Math.round(end1 * eased)
          setText(end2 !== null ? `${n1}/${Math.round(end2 * eased)}` : String(n1))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value])

  return (
    <span ref={ref} className="tabular-nums" aria-hidden="true">
      {text}
    </span>
  )
}

/** Keyword → icon so every result stat reads at a glance. First match wins. */
const RESULT_ICON: Array<[RegExp, LucideIcon]> = [
  [/test|qa/i, FlaskConical],
  [/error|lint/i, Bug],
  [/surface|admin|panel/i, LayoutGrid],
  [/branch/i, GitBranch],
  [/table|schema|database/i, Database],
  [/award|star/i, Trophy],
  [/report|card|pdf|sf\d/i, FileText],
  [/live|socket|dashboard/i, Radio],
  [/weight/i, Percent],
  [/flow|schedul/i, Workflow],
  [/office|campus/i, Building2],
  [/status|prototype/i, Flag],
  [/\bai\b|helper/i, Bot],
  [/role|user|student|faculty|access/i, Users],
]

function resultIcon(label: string): LucideIcon {
  return RESULT_ICON.find(([re]) => re.test(label))?.[1] ?? BarChart3
}

/** Icon-headed narrative section: label row + accent-edged body panel. */
function Block({
  label,
  icon: Icon,
  accent,
  children,
}: {
  label: string
  icon: LucideIcon
  accent: string
  children: React.ReactNode
}) {
  return (
    <Reveal className="border-t border-line pt-8">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface"
          style={{ color: accent }}
          aria-hidden="true"
        >
          <Icon size={16} />
        </span>
        <p className="label">/// {label}</p>
      </div>
      <div
        className="max-w-2xl border-l-2 bg-surface px-5 py-4 leading-relaxed text-mute"
        style={{ borderColor: accent }}
      >
        {children}
      </div>
    </Reveal>
  )
}

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const { data: project, isLoading, error } = useProject(slug)
  const { data: all = [] } = useProjects()
  const { data: posts = [] } = usePosts()
  const barRef = useRef<HTMLSpanElement>(null)

  // Reading-progress bar for this long page: transform-only, rAF-throttled.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = barRef.current
      if (!el) return
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const progress = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0
      el.style.transform = `scaleX(${progress})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [project])

  // This project's notes, ordered beginner → advanced.
  const notes = useMemo(
    () =>
      posts
        .filter((p) => p.project_slug === slug)
        .sort((a, b) => levelRank(a.level) - levelRank(b.level)),
    [posts, slug],
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-20 sm:px-6">
        <div className="h-12 w-2/3 brutal-flat animate-pulse bg-surface" />
        <div className="h-64 brutal-flat animate-pulse bg-surface" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <p className="label mb-4">/// 404</p>
        <h1 className="section-title">Project not found</h1>
        <Link
          to="/projects"
          className="brutal brutal-hover mt-8 inline-flex items-center gap-2 bg-surface px-5 py-3 font-mono text-sm font-bold tracking-widest"
        >
          <ArrowLeft size={15} /> BACK TO WORK
        </Link>
      </div>
    )
  }

  const index = all.findIndex((p) => p.slug === project.slug)
  const next = all.length > 1 && index >= 0 ? all[(index + 1) % all.length] : null
  const wonAward = project.tags.some((t) => t.name.toLowerCase() === 'award')

  return (
    <article>
      <span
        ref={barRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 h-0.5 w-full origin-left bg-accent"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* header */}
      <header className="grid-bg relative overflow-hidden border-b border-line">
        <div className="starfield" aria-hidden="true" />
        <span className="scan-line" aria-hidden="true" />
        <div className="aurora">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <Reveal>
            <Link
              to="/projects"
              className="link-underline inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-mute hover:text-accent"
            >
              <ArrowLeft size={13} /> ALL PROJECTS
            </Link>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="mt-8 mb-4 flex flex-wrap items-center gap-3">
              <p className="label">/// CASE STUDY · {String(index + 1).padStart(2, '0')}</p>
              {wonAward && (
                <span
                  className="brutal-flat inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[0.6rem] font-bold tracking-widest"
                  style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                  title="Star Web Development & UX/UI Design Award — Zuitt 2024"
                >
                  <Trophy size={10} aria-hidden="true" /> AWARD
                </span>
              )}
            </div>
            <h1 className="section-title text-[clamp(2.2rem,1.4rem+4vw,4rem)]">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mute">{project.summary}</p>
            {project.rating && (
              <div className="mt-5 flex items-center gap-3">
                <StarRating value={project.rating} size={16} />
                <span className="label">author rating</span>
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-3">
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer noopener"
                className="brutal brutal-hover inline-flex items-center gap-2 bg-accent px-5 py-3 font-mono text-xs font-bold tracking-widest text-accent-ink"
              >
                LIVE DEMO <ExternalLink size={14} />
              </a>
            )}
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer noopener"
                className="brutal brutal-hover inline-flex items-center gap-2 bg-surface px-5 py-3 font-mono text-xs font-bold tracking-widest"
              >
                SOURCE <GithubIcon size={14} />
              </a>
            )}
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_260px]">
          <div className="space-y-10">
            {project.demo_video && (
              <Reveal className="border-t border-line pt-8">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-accent"
                    aria-hidden="true"
                  >
                    <Play size={15} className="fill-current" />
                  </span>
                  <p className="label">/// DEMO VIDEO</p>
                </div>
                <div className="brutal bg-surface p-2">
                  <video
                    src={project.demo_video}
                    poster={project.demo_video.endsWith('.mp4') ? project.demo_video.replace(/\.mp4$/, '.jpg') : undefined}
                    controls
                    preload="metadata"
                    playsInline
                    aria-label={`${project.title} demo video`}
                    className="aspect-video w-full bg-black object-contain"
                  />
                </div>
                <p className="mt-3 flex items-center gap-2 font-mono text-[0.68rem] tracking-widest text-mute">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  {project.title.toUpperCase()} — DEMO WALKTHROUGH
                </p>
              </Reveal>
            )}
            <Block label="PROBLEM" icon={AlertTriangle} accent="var(--neon-4)">
              <p>{project.problem}</p>
            </Block>
            <Block label="APPROACH" icon={Workflow} accent="var(--neon-2)">
              <p>{project.approach}</p>
            </Block>

            {project.results.length > 0 && (
              <Reveal className="border-t border-line pt-8">
                <p className="label mb-4">/// RESULTS</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {project.results.map((r, i) => {
                    const color = NEON[i % NEON.length]
                    const Icon = resultIcon(r.label)
                    return (
                      <div
                        key={r.label}
                        className="neon-card p-5"
                        style={{ ['--card-neon' as string]: color }}
                      >
                        <span
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-bg"
                          style={{ color }}
                          aria-hidden="true"
                        >
                          <Icon size={16} />
                        </span>
                        <p
                          className="mt-4 font-mono text-3xl font-bold"
                          style={{ color }}
                          aria-label={r.value}
                        >
                          <CountUp value={r.value} />
                        </p>
                        <p className="label mt-2 leading-snug">{r.label}</p>
                      </div>
                    )
                  })}
                </div>
              </Reveal>
            )}
          </div>

          {/* meta sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <VoteWidget
              projectId={project.id}
              initialAvg={project.rating_avg}
              initialCount={project.rating_count}
            />

            <div className="brutal-flat bg-surface p-5">
              <p className="label mb-3">/// STACK</p>
              {/* GitHub-style stack spectrum — one segment per tech, equal share,
                  wiping in left-to-right with a per-tech stagger */}
              {project.tech_stack.length > 0 && (
                <div
                  className="mb-4 flex h-2 gap-px overflow-hidden rounded-full"
                  role="img"
                  aria-label={`Stack composition: ${project.tech_stack.join(', ')}`}
                >
                  {project.tech_stack.map((tech, i) => (
                    <span
                      key={tech}
                      className="spectrum-seg h-full flex-1"
                      style={{
                        background: techColor(tech),
                        boxShadow: `0 0 8px ${techColor(tech)}66`,
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  ))}
                </div>
              )}
              <ul className="space-y-2 font-mono text-sm">
                {project.tech_stack.map((tech) => {
                  const c = techColor(tech)
                  return (
                    <li key={tech} className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: c, boxShadow: `0 0 6px ${c}` }}
                        aria-hidden="true"
                      />
                      <span style={{ color: `color-mix(in srgb, ${c} 80%, var(--ink))` }}>{tech}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {project.tags.length > 0 && (
              <div className="brutal-flat bg-surface p-5">
                <p className="label mb-3">/// TAGS</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <span
                      key={t.id}
                      className="brutal-flat cursor-default bg-bg px-2 py-1 font-mono text-[0.65rem] tracking-wider text-mute uppercase transition-colors hover:border-accent hover:text-accent"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {notes.length > 0 && (
              <div className="brutal-flat bg-surface">
                <p className="label border-b border-line p-4">
                  /// NOTES{' '}
                  <span className="text-accent">{String(notes.length).padStart(2, '0')}</span>
                </p>
                <ul>
                  {notes.map((n) => {
                    const lvl = levelMeta(n.level)
                    const LvlIcon = lvl?.icon
                    return (
                      <li key={n.id} className="border-b border-line last:border-b-0">
                        <Link
                          to={`/writing/${n.slug}`}
                          className="group flex items-start gap-2.5 p-4 transition-colors hover:bg-bg"
                        >
                          {lvl && LvlIcon ? (
                            <LvlIcon
                              size={13}
                              className="mt-0.5 shrink-0"
                              style={{ color: lvl.color }}
                              aria-hidden="true"
                            />
                          ) : (
                            <FileText size={13} className="mt-0.5 shrink-0 text-mute" aria-hidden="true" />
                          )}
                          <span className="text-[0.8rem] leading-snug text-mute transition-all group-hover:translate-x-0.5 group-hover:text-accent">
                            {n.title}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <Link
                  to={`/writing?project=${project.slug}`}
                  className="flex items-center justify-between border-t border-line p-4 font-mono text-[0.62rem] tracking-widest text-mute transition-colors hover:text-accent"
                >
                  ALL NOTES <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </div>
            )}

            <div className="brutal-flat bg-surface p-5">
              <p className="label mb-3">/// STATUS</p>
              <p className="flex items-center gap-2.5 font-mono text-sm">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:hidden"
                    style={{ background: 'var(--neon-6)' }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ background: 'var(--neon-6)' }}
                  />
                </span>
                {project.status.toUpperCase()}
              </p>
              <p className="label mt-4 mb-1">/// SHIPPED</p>
              <p className="flex items-center gap-2 font-mono text-sm text-mute">
                <CalendarDays size={14} aria-hidden="true" />
                {new Date(project.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </aside>
        </div>

        {next && next.slug !== project.slug && (
          <Reveal className="mt-16 border-t border-line pt-8">
            <p className="label mb-4">/// UP NEXT</p>
            <Link
              to={`/projects/${next.slug}`}
              className="group brutal brutal-hover flex items-center justify-between gap-6 bg-surface p-6 sm:p-8"
            >
              <div className="min-w-0">
                <p className="font-mono text-2xl font-bold tracking-tight transition-colors group-hover:text-accent sm:text-3xl">
                  {next.title}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  {next.tech_stack.slice(0, 5).map((tech) => {
                    const c = techColor(tech)
                    return (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] tracking-widest text-mute uppercase"
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: c, boxShadow: `0 0 6px ${c}` }}
                          aria-hidden="true"
                        />
                        {tech}
                      </span>
                    )
                  })}
                </div>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line bg-bg transition-all duration-300 group-hover:border-accent group-hover:shadow-[0_0_18px_var(--accent)]">
                <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        )}
      </div>
    </article>
  )
}
