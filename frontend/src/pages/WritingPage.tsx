import { useMemo, useState } from 'react'
import { ArrowUpRight, Newspaper } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { formatDate, readingTime } from '../lib/format'
import { usePosts, useProjects } from '../lib/hooks'
import { categoryForTags } from '../lib/postCategories'
import { levelMeta, levelRank, POST_LEVELS } from '../lib/postLevels'
import type { Post } from '../lib/types'

type Chip = { id: string; label: string; count: number }

type Group = { key: string; list: Post[]; newest: number }

const GENERAL = 'general'

/** Epoch ms for sorting; invalid dates fall back to 0. */
const time = (p: Post): number => Date.parse(p.published_at ?? p.created_at) || 0

export default function WritingPage() {
  const { data: posts = [], isLoading, error } = usePosts()
  const { data: projects = [] } = useProjects()
  const [searchParams, setSearchParams] = useSearchParams()
  const [project, setProject] = useState<string>(() => searchParams.get('project') ?? 'all')
  const [level, setLevel] = useState<string>('all')

  const titleFor = useMemo(() => {
    const bySlug = new Map(projects.map((p) => [p.slug, p.title]))
    return (slug: string) => bySlug.get(slug) ?? slug
  }, [projects])

  const keyOf = (p: Post): string => p.project_slug ?? GENERAL

  // Faceted counts: each chip row counts what the *other* row's filter leaves.
  const projectCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of posts) {
      if (level !== 'all' && p.level !== level) continue
      counts.set(keyOf(p), (counts.get(keyOf(p)) ?? 0) + 1)
    }
    return counts
  }, [posts, level])

  const levelCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of posts) {
      if (project !== 'all' && keyOf(p) !== project) continue
      if (p.level) counts.set(p.level, (counts.get(p.level) ?? 0) + 1)
    }
    return counts
  }, [posts, project])

  const projectChips = useMemo<Chip[]>(() => {
    const overall = new Map<string, number>()
    posts.forEach((p) => overall.set(keyOf(p), (overall.get(keyOf(p)) ?? 0) + 1))
    const total = posts.filter((p) => level === 'all' || p.level === level).length
    const withNotes = [...overall.keys()].filter((k) => k !== GENERAL && overall.get(k)! > 0)
    const byWeight = projects
      .filter((pr) => withNotes.includes(pr.slug))
      .map((pr) => ({ id: pr.slug, label: pr.title.toUpperCase(), weight: overall.get(pr.slug) ?? 0 }))
      .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label))
    const chips: Chip[] = [{ id: 'all', label: 'ALL', count: total }, ...byWeight.map(({ id, label }) => ({ id, label, count: projectCounts.get(id) ?? 0 }))]
    if (overall.get(GENERAL)) {
      chips.push({ id: GENERAL, label: 'GENERAL', count: projectCounts.get(GENERAL) ?? 0 })
    }
    return chips
  }, [posts, projects, projectCounts, level])

  const levelChips = useMemo<Chip[]>(
    () => [
      { id: 'all', label: 'ALL', count: posts.filter((p) => project === 'all' || keyOf(p) === project).length },
      ...POST_LEVELS.map((l) => ({ id: l.id, label: l.label, count: levelCounts.get(l.id) ?? 0 })),
    ],
    [posts, levelCounts, project],
  )

  // Visible notes, bucketed per project, ordered beginner → advanced inside.
  const groups = useMemo<Group[]>(() => {
    const buckets = new Map<string, Post[]>()
    for (const p of posts) {
      if (project !== 'all' && keyOf(p) !== project) continue
      if (level !== 'all' && p.level !== level) continue
      const key = keyOf(p)
      const bucket = buckets.get(key)
      if (bucket) bucket.push(p)
      else buckets.set(key, [p])
    }
    const entries: Group[] = [...buckets.entries()].map(([key, list]) => ({
      key,
      list: list.sort((a, b) => levelRank(a.level) - levelRank(b.level) || time(b) - time(a)),
      newest: Math.max(...list.map(time)),
    }))
    // Projects with the freshest notes first; GENERAL always closes the list.
    return entries.sort((a, b) => {
      if (a.key === GENERAL) return 1
      if (b.key === GENERAL) return -1
      return b.newest - a.newest
    })
  }, [posts, project, level])

  const pickProject = (id: string) => {
    setProject(id)
    const next = new URLSearchParams(searchParams)
    if (id === 'all') next.delete('project')
    else next.set('project', id)
    setSearchParams(next, { replace: true })
  }

  return (
    <>
      <PageHero
        label="WRITING"
        title={
          <>
            Notes from the <span className="grad-text">build</span>
          </>
        }
        icon={Newspaper}
        ghost="WRITING"
        kicker="An engineering notebook per project — each system documented from its first beginner problem to the advanced design it became, plus general craft notes."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        {isLoading && (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 brutal-flat animate-pulse bg-surface" />
            ))}
          </div>
        )}

        {error && (
          <p className="brutal-flat bg-surface p-6 font-mono text-sm text-mute">
            Could not load posts — is the API running on :8000?
          </p>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <p className="font-mono text-sm text-mute">Nothing published yet.</p>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <div className="mb-10 space-y-3">
            <Reveal className="flex flex-wrap gap-2" delay={0}>
              {projectChips.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickProject(c.id)}
                  aria-pressed={project === c.id}
                  className={`brutal-flat inline-flex items-center gap-2 px-3 py-2.5 font-mono text-[0.68rem] tracking-widest uppercase transition-colors sm:py-1.5 ${
                    project === c.id ? 'bg-accent text-accent-ink' : 'bg-surface hover:border-accent'
                  }`}
                >
                  {c.label}
                  <span className={project === c.id ? 'text-accent-ink/70' : 'text-mute'}>{c.count}</span>
                </button>
              ))}
            </Reveal>
            <Reveal className="flex flex-wrap items-center gap-2" delay={0.05}>
              <span className="mr-1 font-mono text-[0.6rem] tracking-widest text-mute">LEVEL</span>
              {levelChips.map((c) => {
                const meta = c.id === 'all' ? null : levelMeta(c.id)
                const Icon = meta?.icon
                const active = level === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setLevel(c.id)}
                    aria-pressed={active}
                    className={`brutal-flat inline-flex items-center gap-2 px-3 py-2.5 font-mono text-[0.68rem] tracking-widest uppercase transition-colors sm:py-1.5 ${
                      active ? 'bg-accent text-accent-ink' : 'bg-surface hover:border-accent'
                    }`}
                    style={!active && meta ? { color: meta.color } : undefined}
                  >
                    {Icon && <Icon size={12} aria-hidden="true" />}
                    {c.label}
                    <span className={active ? 'text-accent-ink/70' : 'text-mute'}>{c.count}</span>
                  </button>
                )
              })}
            </Reveal>
          </div>
        )}

        <div className="space-y-14">
          {groups.map((group, gi) => (
            <section key={group.key}>
              <Reveal>
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-b border-line pb-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                    <span className="font-mono text-xs tracking-widest text-mute">
                      {String(gi + 1).padStart(2, '0')}
                    </span>
                    <h2 className="font-mono text-base font-bold tracking-tight sm:text-lg">
                      {group.key === GENERAL ? 'GENERAL NOTES' : titleFor(group.key)}
                    </h2>
                    <span className="brutal-flat bg-surface px-2 py-0.5 font-mono text-[0.62rem] tracking-widest text-mute">
                      {group.list.length} {group.list.length === 1 ? 'NOTE' : 'NOTES'}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {POST_LEVELS.filter((l) => group.list.some((p) => p.level === l.id)).map((l) => {
                        const LvlIcon = l.icon
                        return (
                          <span
                            key={l.id}
                            className="inline-flex items-center gap-1 font-mono text-[0.6rem] tracking-widest"
                            style={{ color: l.color }}
                          >
                            <LvlIcon size={10} aria-hidden="true" />
                            {l.label}
                          </span>
                        )
                      })}
                    </span>
                  </div>
                  {group.key !== GENERAL && (
                    <Link
                      to={`/projects/${group.key}`}
                      className="link-underline inline-flex shrink-0 items-center gap-1.5 font-mono text-[0.65rem] tracking-widest text-mute hover:text-accent"
                    >
                      VIEW PROJECT <ArrowUpRight size={12} aria-hidden="true" />
                    </Link>
                  )}
                </header>
              </Reveal>

              <div className="border-t border-line">
                {group.list.map((post, i) => (
                  <PostRow key={post.id} post={post} index={i} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {!isLoading && !error && posts.length > 0 && groups.length === 0 && (
          <p className="font-mono text-sm text-mute">No notes match this combination yet.</p>
        )}
      </div>
    </>
  )
}

function PostRow({ post, index }: { post: Post; index: number }) {
  const cat = categoryForTags(post.tags)
  const lvl = levelMeta(post.level)
  const Icon = cat.icon
  const LvlIcon = lvl?.icon

  return (
    <Reveal delay={Math.min(index * 0.05, 0.3)}>
      <Link
        to={`/writing/${post.slug}`}
        className="group flex flex-col gap-4 border-b border-line px-1 py-7 transition-colors hover:bg-surface sm:flex-row sm:items-baseline sm:gap-8"
      >
        <span className="shrink-0 font-mono text-xs tracking-widest text-mute">
          {formatDate(post.published_at ?? post.created_at)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-surface transition-colors group-hover:border-[color:var(--cat)]"
              style={{ ['--cat' as string]: cat.color, color: cat.color }}
              aria-hidden="true"
            >
              <Icon size={15} />
            </span>
            <div className="min-w-0">
              <h2 className="font-mono text-lg font-bold tracking-tight transition-colors group-hover:text-accent sm:text-xl">
                {post.title}
              </h2>
              <p className="mt-1.5 line-clamp-2 text-sm text-mute">{post.excerpt}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.68rem] tracking-widest text-mute uppercase">
                <span style={{ color: cat.color }}>{cat.label}</span>
                <span aria-hidden="true">·</span>
                {lvl && LvlIcon && (
                  <span className="inline-flex items-center gap-1" style={{ color: lvl.color }}>
                    <LvlIcon size={11} aria-hidden="true" />
                    {lvl.label}
                  </span>
                )}
                <span aria-hidden="true">·</span>
                <span>{post.reading_minutes ?? readingTime(post.content_md ?? '')} min read</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden max-w-[28ch] truncate font-mono text-[0.65rem] tracking-widest text-mute md:block">
            {post.tags.map((t) => `#${t}`).join(' ')}
          </span>
          <ArrowUpRight
            size={18}
            className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
          />
        </div>
      </Link>
    </Reveal>
  )
}
