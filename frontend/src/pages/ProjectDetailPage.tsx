import { ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react'
import { GithubIcon } from '../components/SocialIcons'
import { Link, useParams } from 'react-router-dom'
import Reveal from '../components/Reveal'
import StarRating from '../components/StarRating'
import VoteWidget from '../components/VoteWidget'
import { useProject, useProjects } from '../lib/hooks'
import { techColor } from '../lib/techColors'

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Reveal className="border-t border-line pt-8">
      <p className="label mb-4">/// {label}</p>
      <div className="max-w-2xl leading-relaxed text-mute">{children}</div>
    </Reveal>
  )
}

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const { data: project, isLoading, error } = useProject(slug)
  const { data: all = [] } = useProjects()

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
                  className="brutal-flat px-2 py-0.5 font-mono text-[0.6rem] font-bold tracking-widest"
                  style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
                  title="Star Web Development & UX/UI Design Award — Zuitt 2024"
                >
                  ★ AWARD
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
            <Block label="PROBLEM">
              <p>{project.problem}</p>
            </Block>
            <Block label="APPROACH">
              <p>{project.approach}</p>
            </Block>

            {project.results.length > 0 && (
              <Reveal className="border-t border-line pt-8">
                <p className="label mb-4">/// RESULTS</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {project.results.map((r) => (
                    <div key={r.label} className="brutal bg-surface p-5">
                      <p className="font-mono text-3xl font-bold text-accent">{r.value}</p>
                      <p className="label mt-2 leading-snug">{r.label}</p>
                    </div>
                  ))}
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
              <p className="label mb-3">STACK</p>
              {/* GitHub-style stack spectrum — one segment per tech, equal share */}
              {project.tech_stack.length > 0 && (
                <div
                  className="mb-4 flex h-2 overflow-hidden rounded-full"
                  role="img"
                  aria-label={`Stack composition: ${project.tech_stack.join(', ')}`}
                >
                  {project.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="h-full flex-1"
                      style={{
                        background: techColor(tech),
                        boxShadow: `0 0 8px ${techColor(tech)}66`,
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
                <p className="label mb-3">TAGS</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <span
                      key={t.id}
                      className="brutal-flat bg-bg px-2 py-1 font-mono text-[0.65rem] tracking-wider uppercase"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="brutal-flat bg-surface p-5">
              <p className="label mb-2">STATUS</p>
              <p className="font-mono text-sm">
                <span className="mr-2 inline-block h-2 w-2 bg-accent" />
                {project.status.toUpperCase()}
              </p>
              <p className="label mt-4 mb-1">SHIPPED</p>
              <p className="font-mono text-sm">
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
            <Link
              to={`/projects/${next.slug}`}
              className="group brutal brutal-hover flex items-center justify-between gap-4 bg-surface p-6"
            >
              <div>
                <p className="label mb-2">NEXT PROJECT</p>
                <p className="font-mono text-xl font-bold tracking-tight group-hover:text-accent">
                  {next.title}
                </p>
              </div>
              <ArrowRight
                size={22}
                className="shrink-0 transition-transform group-hover:translate-x-1.5"
              />
            </Link>
          </Reveal>
        )}
      </div>
    </article>
  )
}
