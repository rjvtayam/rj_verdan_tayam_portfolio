import { useMemo, useState } from 'react'
import { ArrowUpRight, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'
import { formatDate, readingTime } from '../lib/format'
import { usePosts } from '../lib/hooks'
import { categoryForTags } from '../lib/postCategories'
import type { Post } from '../lib/types'

type Filter = { id: string; label: string; count: number }

export default function WritingPage() {
  const { data: posts = [], isLoading, error } = usePosts()
  const [active, setActive] = useState<string>('all')

  // Category of each post, memoized so filtering stays cheap.
  const categorized = useMemo(() => posts.map((post) => ({ post, cat: categoryForTags(post.tags) })), [posts])

  const filters = useMemo<Filter[]>(() => {
    const counts = new Map<string, number>()
    categorized.forEach(({ cat }) => counts.set(cat.id, (counts.get(cat.id) ?? 0) + 1))
    return [
      { id: 'all', label: 'ALL', count: categorized.length },
      ...[...counts.entries()].map(([id, count]) => ({ id, label: id.toUpperCase(), count })),
    ]
  }, [categorized])

  const visible = active === 'all' ? categorized : categorized.filter((c) => c.cat.id === active)

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
        kicker="Practical write-ups drawn from the projects themselves — architecture, PostgreSQL, security and shipping software that holds up."
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
          <Reveal className="mb-8 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActive(f.id)}
                aria-pressed={active === f.id}
                className={`brutal-flat inline-flex items-center gap-2 px-3 py-2.5 font-mono text-[0.68rem] tracking-widest uppercase transition-colors sm:py-1.5 ${
                  active === f.id ? 'bg-accent text-accent-ink' : 'bg-surface hover:border-accent'
                }`}
              >
                {f.label}
                <span className={active === f.id ? 'text-accent-ink/70' : 'text-mute'}>{f.count}</span>
              </button>
            ))}
          </Reveal>
        )}

        <div className="border-t border-line">
          {visible.map(({ post, cat }, i) => (
            <PostRow key={post.id} post={post} cat={cat} index={i} />
          ))}
        </div>

        {!isLoading && !error && visible.length === 0 && (
          <p className="font-mono text-sm text-mute">No notes in this category yet.</p>
        )}
      </div>
    </>
  )
}

function PostRow({
  post,
  cat,
  index,
}: {
  post: Post
  cat: ReturnType<typeof categoryForTags>
  index: number
}) {
  const Icon = cat.icon
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
                <span>{readingTime(post.content_md)} min read</span>
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
