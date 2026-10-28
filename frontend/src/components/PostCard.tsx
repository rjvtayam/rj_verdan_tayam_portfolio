import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import { formatDate, readingTime } from '../lib/format'
import { categoryForTags } from '../lib/postCategories'
import { levelMeta } from '../lib/postLevels'
import type { Post } from '../lib/types'

export default function PostCard({ post, index }: { post: Post; index: number }) {
  const cat = categoryForTags(post.tags)
  const lvl = levelMeta(post.level)
  const Icon = cat.icon
  const LvlIcon = lvl?.icon

  return (
    <Reveal delay={index * 0.06}>
      <Link
        to={`/writing/${post.slug}`}
        className="neon-card group flex h-full flex-col p-6"
        style={{ ['--card-neon' as string]: cat.color }}
      >
        <div className="flex items-center justify-between font-mono text-xs tracking-widest text-mute">
          <span className="inline-flex items-center gap-2" style={{ color: cat.color }}>
            <Icon size={14} aria-hidden="true" />
            {cat.label.toUpperCase()}
          </span>
          <ArrowUpRight
            size={16}
            className="transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1"
            style={{ color: cat.color }}
          />
        </div>
        <h3 className="mt-5 font-mono text-xl leading-snug font-bold tracking-tight" style={{ color: cat.color }}>
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mute">{post.excerpt}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-6 font-mono text-[0.62rem] tracking-widest text-mute uppercase">
          <span>{formatDate(post.published_at ?? post.created_at)}</span>
          <span aria-hidden="true">·</span>
          {lvl && LvlIcon && (
            <span className="inline-flex items-center gap-1" style={{ color: lvl.color }}>
              <LvlIcon size={10} aria-hidden="true" />
              {lvl.label}
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span>{post.reading_minutes ?? readingTime(post.content_md ?? '')} min read</span>
        </div>
      </Link>
    </Reveal>
  )
}
