import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal'
import StarRating from './StarRating'
import { techColor } from '../lib/techColors'
import type { Project } from '../lib/types'

const NEON = ['var(--neon-1)', 'var(--neon-2)', 'var(--neon-3)', 'var(--neon-4)', 'var(--neon-5)', 'var(--neon-6)']

type Props = {
  project: Project
  index: number
  featured?: boolean
}

export default function ProjectCard({ project, index, featured = false }: Props) {
  const color = NEON[index % NEON.length]
  const wonAward = project.tags.some((t) => t.name.toLowerCase() === 'award')

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg) translateY(-5px)`
  }

  const onLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = ''
  }

  return (
    <Reveal delay={index * 0.07}>
      <Link
        to={`/projects/${project.slug}`}
        className={`neon-card group flex h-full flex-col p-6 ${featured ? 'md:p-8' : ''}`}
        style={{ ['--card-neon' as string]: color }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <div className="flex items-start justify-between">
          <span className="neon-text font-mono text-xs font-bold tracking-widest">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-2">
            {project.featured && (
              <span
                className="brutal-flat px-2 py-0.5 font-mono text-[0.6rem] font-bold tracking-widest"
                style={{ background: color, color: '#0a0a0c' }}
              >
                FEATURED
              </span>
            )}
            {wonAward && (
              <span
                className="brutal-flat px-2 py-0.5 font-mono text-[0.6rem] font-bold tracking-widest"
                style={{ color, borderColor: color }}
                title="Star Web Development & UX/UI Design Award — Zuitt 2024"
              >
                ★ AWARD
              </span>
            )}
            <ArrowUpRight
              size={18}
              className="transition-transform duration-200 group-hover:-translate-y-1 group-hover:translate-x-1"
              style={{ color }}
            />
          </div>
        </div>

        <h3
          className={`mt-6 font-mono font-bold tracking-tight ${
            featured ? 'text-3xl md:text-4xl' : 'text-2xl'
          }`}
        >
          {project.title}
        </h3>
        <p className={`mt-3 text-sm leading-relaxed text-mute ${featured ? '' : 'line-clamp-3'}`}>
          {project.summary}
        </p>

        {(project.rating || project.rating_count > 0) && (
          <div className="mt-4 flex items-center gap-3">
            <StarRating value={project.rating ?? project.rating_avg ?? 0} size={14} />
            <span className="font-mono text-[0.65rem] text-mute">
              {project.rating_count > 0 && project.rating_avg
                ? `visitor avg ${project.rating_avg.toFixed(1)} (${project.rating_count})`
                : 'rated by author'}
            </span>
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap gap-2">
            {project.tech_stack.slice(0, featured ? 6 : 4).map((tech) => {
              const c = techColor(tech)
              return (
                <span
                  key={tech}
                  className="flex items-center gap-1.5 border px-2 py-1 font-mono text-[0.62rem] tracking-wider uppercase transition-colors"
                  style={{
                    borderColor: `color-mix(in srgb, ${c} 45%, var(--line))`,
                    background: `color-mix(in srgb, ${c} 9%, transparent)`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: c, boxShadow: `0 0 6px ${c}` }}
                    aria-hidden="true"
                  />
                  <span style={{ color: `color-mix(in srgb, ${c} 82%, var(--ink))` }}>{tech}</span>
                </span>
              )
            })}
          </div>
          {project.tags.length > 0 && (
            <p className="mt-4 font-mono text-[0.65rem] tracking-widest text-mute">
              #{project.tags.map((t) => t.name).join('  #')}
            </p>
          )}
        </div>
      </Link>
    </Reveal>
  )
}
