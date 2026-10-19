import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import { formatDate } from '../lib/format'
import type { Post } from '../lib/types'

const NEON = ['var(--neon-4)', 'var(--neon-5)', 'var(--neon-6)', 'var(--neon-2)', 'var(--neon-3)', 'var(--neon-1)']

export default function PostCard({ post, index }: { post: Post; index: number }) {
  const color = NEON[index % NEON.length]

  return (
    <Reveal delay={index * 0.06}>
      <Link
        to={`/writing/${post.slug}`}
        className="neon-card group flex h-full flex-col p-6"
        style={{ ['--card-neon' as string]: color }}
      >
        <div className="flex items-center justify-between font-mono text-xs tracking-widest text-mute">
          <span>{formatDate(post.published_at ?? post.created_at)}</span>
          <ArrowUpRight
            size={16}
            className="transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1"
            style={{ color }}
          />
        </div>
        <h3 className="mt-5 font-mono text-xl leading-snug font-bold tracking-tight" style={{ color }}>
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mute">{post.excerpt}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[0.62rem] tracking-widest text-mute uppercase"
            >
              #{tag}
            </span>
          ))}
        </div>
      </Link>
    </Reveal>
  )
}
