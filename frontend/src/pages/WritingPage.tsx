import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { formatDate } from '../lib/format'
import { usePosts } from '../lib/hooks'

export default function WritingPage() {
  const { data: posts = [], isLoading, error } = usePosts()

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <Reveal>
        <p className="label mb-3">/// WRITING</p>
        <h1 className="section-title text-[clamp(2.2rem,1.4rem+3.4vw,3.6rem)]">
          Notes from the <span className="text-accent">build</span>
        </h1>
        <p className="mt-4 max-w-2xl text-mute">
          Practical write-ups on architecture, PostgreSQL, React and shipping software that holds up.
        </p>
      </Reveal>

      <div className="mt-12">
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

        <div className="border-t border-line">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 0.05}>
              <Link
                to={`/writing/${post.slug}`}
                className="group flex flex-col gap-3 border-b border-line px-1 py-7 transition-colors hover:bg-surface sm:flex-row sm:items-baseline sm:gap-8"
              >
                <span className="shrink-0 font-mono text-xs tracking-widest text-mute">
                  {formatDate(post.published_at ?? post.created_at)}
                </span>
                <div className="flex-1">
                  <h2 className="font-mono text-lg font-bold tracking-tight transition-colors group-hover:text-accent sm:text-xl">
                    {post.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 text-sm text-mute">{post.excerpt}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden font-mono text-[0.65rem] tracking-widest text-mute md:inline">
                    {post.tags.map((t) => `#${t}`).join(' ')}
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}
