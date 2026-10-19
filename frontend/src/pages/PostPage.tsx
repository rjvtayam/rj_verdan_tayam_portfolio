import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Reveal from '../components/Reveal'
import { formatDate } from '../lib/format'
import { usePost, usePosts } from '../lib/hooks'

export default function PostPage() {
  const { slug } = useParams()
  const { data: post, isLoading, error } = usePost(slug)
  const { data: all = [] } = usePosts()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-20 sm:px-6">
        <div className="h-10 w-3/4 brutal-flat animate-pulse bg-surface" />
        <div className="h-80 brutal-flat animate-pulse bg-surface" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="label mb-4">/// 404</p>
        <h1 className="section-title">Post not found</h1>
        <Link
          to="/writing"
          className="brutal brutal-hover mt-8 inline-flex items-center gap-2 bg-surface px-5 py-3 font-mono text-sm font-bold tracking-widest"
        >
          <ArrowLeft size={15} /> BACK TO WRITING
        </Link>
      </div>
    )
  }

  const index = all.findIndex((p) => p.slug === post.slug)
  const next = all.length > 1 && index >= 0 ? all[(index + 1) % all.length] : null

  return (
    <article>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
          <Reveal>
            <Link
              to="/writing"
              className="link-underline inline-flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-mute hover:text-accent"
            >
              <ArrowLeft size={13} /> ALL WRITING
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="label mt-8 mb-4">
              /// {formatDate(post.published_at ?? post.created_at)}
            </p>
            <h1 className="section-title text-[clamp(1.9rem,1.2rem+3vw,3.2rem)]">{post.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-mute">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="brutal-flat bg-bg px-2.5 py-1 font-mono text-[0.65rem] tracking-widest uppercase"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-16">
        <div className="prose-tech">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
        </div>

        {next && next.slug !== post.slug && (
          <Reveal className="mt-16 border-t border-line pt-8">
            <Link
              to={`/writing/${next.slug}`}
              className="group brutal brutal-hover flex items-center justify-between gap-4 bg-surface p-6"
            >
              <div>
                <p className="label mb-2">NEXT ARTICLE</p>
                <p className="font-mono text-lg font-bold tracking-tight group-hover:text-accent">
                  {next.title}
                </p>
              </div>
              <ArrowRight size={22} className="shrink-0 transition-transform group-hover:translate-x-1.5" />
            </Link>
          </Reveal>
        )}
      </div>
    </article>
  )
}
