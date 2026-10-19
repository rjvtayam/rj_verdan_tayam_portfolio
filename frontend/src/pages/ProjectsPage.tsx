import { useMemo, useState } from 'react'
import { Terminal as TerminalIcon } from 'lucide-react'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/Reveal'
import { useProjects } from '../lib/hooks'

export default function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useProjects()
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const tags = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => p.tags.forEach((t) => set.add(t.name)))
    return [...set].sort()
  }, [projects])

  const filtered = activeTag
    ? projects.filter((p) => p.tags.some((t) => t.name === activeTag))
    : projects

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <Reveal>
        <p className="label mb-3">/// WORK</p>
        <h1 className="section-title text-[clamp(2.2rem,1.4rem+3.4vw,3.6rem)]">
          Selected <span className="text-accent">projects</span>
        </h1>
        <p className="mt-4 max-w-2xl text-mute">
          Each case study documents the problem, the technical approach and the measured result.
        </p>
      </Reveal>

      {tags.length > 0 && (
        <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={`brutal-flat px-3 py-1.5 font-mono text-[0.68rem] tracking-widest uppercase transition-colors ${
              activeTag === null ? 'bg-accent text-accent-ink' : 'bg-surface hover:border-accent'
            }`}
          >
            ALL
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`brutal-flat px-3 py-1.5 font-mono text-[0.68rem] tracking-widest uppercase transition-colors ${
                activeTag === tag ? 'bg-accent text-accent-ink' : 'bg-surface hover:border-accent'
              }`}
            >
              #{tag}
            </button>
          ))}
        </Reveal>
      )}

      <div className="mt-10">
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 brutal-flat animate-pulse bg-surface" />
            ))}
          </div>
        )}

        {error && (
          <div className="brutal-flat flex items-center gap-3 bg-surface p-6 font-mono text-sm text-mute">
            <TerminalIcon size={16} className="text-accent" />
            Could not load projects — is the API running on :8000?
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <p className="font-mono text-sm text-mute">No projects match this filter.</p>
        )}

        {filtered.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
