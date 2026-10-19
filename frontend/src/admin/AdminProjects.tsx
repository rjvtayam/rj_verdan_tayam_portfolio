import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { ApiError } from '../lib/api'
import { useAdminProjects, useProjectMutations } from '../lib/hooks'
import type { Project } from '../lib/types'
import { Btn, ErrorNote, Field, Input, Panel, TextArea } from './ui'

type Metric = { label: string; value: string }

type FormState = {
  slug: string
  title: string
  summary: string
  problem: string
  approach: string
  results: Metric[]
  tech_stack: string
  tags: string
  repo_url: string
  demo_url: string
  featured: boolean
  rating: string
  status: string
}

const EMPTY: FormState = {
  slug: '',
  title: '',
  summary: '',
  problem: '',
  approach: '',
  results: [],
  tech_stack: '',
  tags: '',
  repo_url: '',
  demo_url: '',
  featured: false,
  rating: '',
  status: 'published',
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function toForm(p: Project): FormState {
  return {
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    problem: p.problem,
    approach: p.approach,
    results: p.results.map((r) => ({ label: r.label, value: r.value })),
    tech_stack: p.tech_stack.join(', '),
    tags: p.tags.map((t) => t.name).join(', '),
    repo_url: p.repo_url ?? '',
    demo_url: p.demo_url ?? '',
    featured: p.featured,
    rating: p.rating ? String(p.rating) : '',
    status: p.status,
  }
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
}

export default function AdminProjects() {
  const { data: projects = [], isLoading } = useAdminProjects(true)
  const mutations = useProjectMutations()
  const [editing, setEditing] = useState<Project | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  const openNew = () => {
    setForm(EMPTY)
    setEditing('new')
    setError(null)
  }

  const openEdit = (p: Project) => {
    setForm(toForm(p))
    setEditing(p)
    setError(null)
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const body = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      summary: form.summary,
      problem: form.problem,
      approach: form.approach,
      results: form.results.filter((r) => r.label && r.value),
      tech_stack: splitList(form.tech_stack),
      tags: splitList(form.tags),
      repo_url: form.repo_url || null,
      demo_url: form.demo_url || null,
      featured: form.featured,
      rating: form.rating ? Number(form.rating) : null,
      status: form.status,
    }
    try {
      if (editing === 'new') await mutations.create.mutateAsync(body)
      else if (editing) await mutations.update.mutateAsync({ id: editing.id, body })
      setEditing(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    }
  }

  const onDelete = async (p: Project) => {
    if (!window.confirm(`Delete project "${p.title}"? This cannot be undone.`)) return
    try {
      await mutations.remove.mutateAsync(p.id)
      if (editing === p) setEditing(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  const setMetric = (i: number, patch: Partial<Metric>) =>
    setForm((f) => ({
      ...f,
      results: f.results.map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
    }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label mb-2">/// PROJECTS</p>
          <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">Manage projects</h1>
        </div>
        {editing === null && (
          <Btn onClick={openNew}>
            <Plus size={14} /> NEW PROJECT
          </Btn>
        )}
      </div>

      <ErrorNote message={error} />

      {editing && (
        <Panel>
          <div className="mb-5 flex items-center justify-between border-b border-line pb-3">
            <p className="label">{editing === 'new' ? 'CREATE' : `EDIT — ${editing.title}`}</p>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close form"
              className="text-mute hover:text-accent"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
            <Field label="TITLE *">
              <Input
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="JNHS Portal"
              />
            </Field>
            <Field label="SLUG" hint="Leave blank to auto-generate from title">
              <Input
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="jnhs-portal"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="SUMMARY *">
                <TextArea
                  required
                  rows={2}
                  value={form.summary}
                  onChange={(e) => set('summary', e.target.value)}
                  placeholder="One-sentence description shown on cards"
                />
              </Field>
            </div>

            <Field label="PROBLEM">
              <TextArea
                rows={4}
                value={form.problem}
                onChange={(e) => set('problem', e.target.value)}
                placeholder="What was broken or missing?"
              />
            </Field>
            <Field label="APPROACH">
              <TextArea
                rows={4}
                value={form.approach}
                onChange={(e) => set('approach', e.target.value)}
                placeholder="How you solved it"
              />
            </Field>

            <div className="md:col-span-2">
              <span className="label mb-2 block">RESULTS / METRICS</span>
              <div className="space-y-2">
                {form.results.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={m.value}
                      onChange={(e) => setMetric(i, { value: e.target.value })}
                      placeholder="96"
                      aria-label="Metric value"
                    />
                    <Input
                      value={m.label}
                      onChange={(e) => setMetric(i, { label: e.target.value })}
                      placeholder="Lighthouse (mobile)"
                      aria-label="Metric label"
                    />
                    <Btn
                      type="button"
                      variant="danger"
                      onClick={() =>
                        setForm((f) => ({ ...f, results: f.results.filter((_, idx) => idx !== i) }))
                      }
                      aria-label="Remove metric"
                    >
                      <Trash2 size={13} />
                    </Btn>
                  </div>
                ))}
                <Btn
                  type="button"
                  variant="ghost"
                  onClick={() => setForm((f) => ({ ...f, results: [...f.results, { label: '', value: '' }] }))}
                >
                  <Plus size={13} /> ADD METRIC
                </Btn>
              </div>
            </div>

            <Field label="TECH STACK" hint="Comma separated">
              <Input
                value={form.tech_stack}
                onChange={(e) => set('tech_stack', e.target.value)}
                placeholder="React, FastAPI, PostgreSQL"
              />
            </Field>
            <Field label="TAGS" hint="Comma separated, lowercase">
              <Input
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="react, fastapi"
              />
            </Field>

            <Field label="REPO URL">
              <Input
                value={form.repo_url}
                onChange={(e) => set('repo_url', e.target.value)}
                placeholder="https://github.com/…"
              />
            </Field>
            <Field label="DEMO URL">
              <Input
                value={form.demo_url}
                onChange={(e) => set('demo_url', e.target.value)}
                placeholder="https://demo.example.com"
              />
            </Field>

            <Field label="AUTHOR RATING" hint="Your own 1–5 score for this project">
              <select
                value={form.rating}
                onChange={(e) => set('rating', e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2.5 font-mono text-sm outline-none focus:border-accent"
              >
                <option value="">— none —</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </Field>
            <Field label="STATUS">
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full border border-line bg-bg px-3.5 py-2.5 font-mono text-sm outline-none focus:border-accent"
              >
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
            </Field>
            <label className="flex items-end gap-3 pb-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              <span className="font-mono text-sm">FEATURED (shown on home)</span>
            </label>

            <div className="flex gap-3 md:col-span-2">
              <Btn type="submit" disabled={mutations.create.isPending || mutations.update.isPending}>
                SAVE PROJECT
              </Btn>
              <Btn type="button" variant="ghost" onClick={() => setEditing(null)}>
                CANCEL
              </Btn>
            </div>
          </form>
        </Panel>
      )}

      <Panel className="p-0">
        {isLoading ? (
          <div className="space-y-2 p-5">
            <div className="h-10 animate-pulse bg-surface-2" />
            <div className="h-10 animate-pulse bg-surface-2" />
          </div>
        ) : projects.length === 0 ? (
          <p className="p-5 font-mono text-sm text-mute">No projects yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--line-soft)]">
            {projects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="font-mono text-xs text-mute">
                  {String(p.id).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-bold">{p.title}</p>
                  <p className="truncate font-mono text-[0.68rem] text-mute">/{p.slug}</p>
                </div>
                <span
                  className={`brutal-flat px-2 py-0.5 font-mono text-[0.6rem] tracking-widest uppercase ${
                    p.status === 'published' ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-mute'
                  }`}
                >
                  {p.status}
                </span>
                {p.featured && (
                  <span className="font-mono text-[0.6rem] tracking-widest text-accent">
                    ★ FEATURED
                  </span>
                )}
                {p.rating && (
                  <span className="font-mono text-[0.6rem] tracking-widest text-mute">
                    ★ {p.rating}/5
                  </span>
                )}
                <div className="flex gap-2">
                  <Btn variant="ghost" onClick={() => openEdit(p)} aria-label={`Edit ${p.title}`}>
                    <Pencil size={13} />
                  </Btn>
                  <Btn variant="danger" onClick={() => onDelete(p)} aria-label={`Delete ${p.title}`}>
                    <Trash2 size={13} />
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
