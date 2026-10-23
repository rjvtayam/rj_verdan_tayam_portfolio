import { useMemo, useState } from 'react'
import { FolderKanban, Terminal as TerminalIcon } from 'lucide-react'
import PageHero from '../components/PageHero'
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
    <>
      <PageHero
        label="WORK"
        title={
          <>
            Selected <span className="grad-text">projects</span>
          </>
        }
        icon={FolderKanban}
        ghost="WORK"
        kicker="Each case study documents the problem, the technical approach and the measured result."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        {tags.length > 0 && (
          <Reveal className="flex flex-wrap gap-2">
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
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  )
}
