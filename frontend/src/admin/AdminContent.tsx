import { useState, type FormEvent } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { ApiError } from '../lib/api'
import {
  useAdminExperiences,
  useAdminSkills,
  useAdminTestimonials,
  useExperienceMutations,
  useSkillMutations,
  useTestimonialMutations,
} from '../lib/hooks'
import type { Experience, Skill, Testimonial } from '../lib/types'
import { Btn, ErrorNote, Field, Input, Panel, TextArea } from './ui'

/* ---------------- skills ---------------- */

type SkillForm = { name: string; category: string; proficiency: number; order: number }
const EMPTY_SKILL: SkillForm = { name: '', category: '', proficiency: 3, order: 0 }

function SkillsPanel() {
  const { data: skills = [] } = useAdminSkills(true)
  const mutations = useSkillMutations()
  const [form, setForm] = useState<SkillForm>(EMPTY_SKILL)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (editingId === null) await mutations.create.mutateAsync(form)
      else await mutations.update.mutateAsync({ id: editingId, body: form })
      setForm(EMPTY_SKILL)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    }
  }

  const edit = (s: Skill) => {
    setForm({ name: s.name, category: s.category, proficiency: s.proficiency, order: s.order })
    setEditingId(s.id)
  }

  const remove = async (s: Skill) => {
    if (!window.confirm(`Delete skill "${s.name}"?`)) return
    try {
      await mutations.remove.mutateAsync(s.id)
      if (editingId === s.id) {
        setEditingId(null)
        setForm(EMPTY_SKILL)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <Panel>
      <p className="label mb-4 border-b border-line pb-3">SKILLS</p>
      <ErrorNote message={error} />

      <form onSubmit={onSubmit} className="mb-5 grid gap-3 sm:grid-cols-2">
        <Field label="NAME">
          <Input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="React"
          />
        </Field>
        <Field label="CATEGORY">
          <Input
            required
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Frontend"
          />
        </Field>
        <Field label="PROFICIENCY (1-5)">
          <select
            value={form.proficiency}
            onChange={(e) => setForm((f) => ({ ...f, proficiency: Number(e.target.value) }))}
            className="w-full border border-line bg-bg px-3.5 py-2.5 font-mono text-sm outline-none focus:border-accent"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ORDER">
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
          />
        </Field>
        <div className="flex gap-2 sm:col-span-2">
          <Btn type="submit" disabled={mutations.create.isPending || mutations.update.isPending}>
            {editingId === null ? 'ADD SKILL' : 'UPDATE SKILL'}
          </Btn>
          {editingId !== null && (
            <Btn
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId(null)
                setForm(EMPTY_SKILL)
              }}
            >
              <X size={13} /> CANCEL
            </Btn>
          )}
        </div>
      </form>

      <ul className="divide-y divide-[var(--line-soft)] border-t border-line-soft">
        {skills.map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-2.5">
            <span className="flex-1 font-mono text-sm">{s.name}</span>
            <span className="label hidden sm:inline">{s.category}</span>
            <span className="font-mono text-xs text-accent">{'█'.repeat(s.proficiency)}</span>
            <button
              type="button"
              onClick={() => edit(s)}
              aria-label={`Edit ${s.name}`}
              className="text-mute hover:text-accent"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => remove(s)}
              aria-label={`Delete ${s.name}`}
              className="text-mute hover:text-accent"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/* ---------------- experiences ---------------- */

type ExpForm = {
  company: string
  role: string
  start_date: string
  end_date: string
  bullets: string
  order: number
}
const EMPTY_EXP: ExpForm = { company: '', role: '', start_date: '', end_date: '', bullets: '', order: 0 }

function ExperiencesPanel() {
  const { data: experiences = [] } = useAdminExperiences(true)
  const mutations = useExperienceMutations()
  const [form, setForm] = useState<ExpForm>(EMPTY_EXP)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const body = {
      company: form.company,
      role: form.role,
      start_date: form.start_date,
      end_date: form.end_date || null,
      bullets: form.bullets
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean),
      order: form.order,
    }
    try {
      if (editingId === null) await mutations.create.mutateAsync(body)
      else await mutations.update.mutateAsync({ id: editingId, body })
      setForm(EMPTY_EXP)
      setEditingId(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    }
  }

  const edit = (exp: Experience) => {
    setForm({
      company: exp.company,
      role: exp.role,
      start_date: exp.start_date,
      end_date: exp.end_date ?? '',
      bullets: exp.bullets.join('\n'),
      order: exp.order,
    })
    setEditingId(exp.id)
  }

  const remove = async (exp: Experience) => {
    if (!window.confirm(`Delete experience "${exp.role}"?`)) return
    try {
      await mutations.remove.mutateAsync(exp.id)
      if (editingId === exp.id) {
        setEditingId(null)
        setForm(EMPTY_EXP)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <Panel>
      <p className="label mb-4 border-b border-line pb-3">EXPERIENCE TIMELINE</p>
      <ErrorNote message={error} />

      <form onSubmit={onSubmit} className="mb-5 grid gap-3 sm:grid-cols-2">
        <Field label="ROLE">
          <Input
            required
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            placeholder="Full-Stack Web Developer"
          />
        </Field>
        <Field label="COMPANY">
          <Input
            required
            value={form.company}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            placeholder="Freelance"
          />
        </Field>
        <Field label="START DATE">
          <Input
            required
            type="date"
            value={form.start_date}
            onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
          />
        </Field>
        <Field label="END DATE (blank = present)">
          <Input
            type="date"
            value={form.end_date}
            onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="BULLETS" hint="One per line">
            <TextArea
              rows={4}
              value={form.bullets}
              onChange={(e) => setForm((f) => ({ ...f, bullets: e.target.value }))}
              placeholder={'Shipped X\nCut Y by Z%'}
            />
          </Field>
        </div>
        <Field label="ORDER">
          <Input
            type="number"
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
          />
        </Field>
        <div className="flex items-end gap-2">
          <Btn type="submit" disabled={mutations.create.isPending}>
            {editingId === null ? 'ADD' : 'UPDATE'}
          </Btn>
          {editingId !== null && (
            <Btn
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId(null)
                setForm(EMPTY_EXP)
              }}
            >
              CANCEL
            </Btn>
          )}
        </div>
      </form>

      <ul className="divide-y divide-[var(--line-soft)] border-t border-line-soft">
        {experiences.map((exp) => (
          <li key={exp.id} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-bold">{exp.role}</p>
              <p className="font-mono text-xs text-mute">
                {exp.company} · {exp.start_date} → {exp.end_date ?? 'present'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => edit(exp)}
              aria-label={`Edit ${exp.role}`}
              className="text-mute hover:text-accent"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => remove(exp)}
              aria-label={`Delete ${exp.role}`}
              className="text-mute hover:text-accent"
            >
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/* ---------------- testimonials ---------------- */

function TestimonialsPanel() {
  const { data: testimonials = [], isLoading } = useAdminTestimonials(true)
  const mutations = useTestimonialMutations()
  const [error, setError] = useState<string | null>(null)

  const toggle = async (t: Testimonial) => {
    setError(null)
    try {
      await mutations.setStatus.mutateAsync({
        id: t.id,
        status: t.status === 'published' ? 'pending' : 'published',
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed')
    }
  }

  const remove = async (t: Testimonial) => {
    if (!window.confirm(`Delete testimonial from "${t.name}"?`)) return
    setError(null)
    try {
      await mutations.remove.mutateAsync(t.id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <Panel>
      <p className="label mb-4 border-b border-line pb-3">TESTIMONIALS</p>
      <ErrorNote message={error} />

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-10 animate-pulse bg-surface-2" />
          <div className="h-10 animate-pulse bg-surface-2" />
        </div>
      ) : testimonials.length === 0 ? (
        <p className="font-mono text-sm text-mute">No testimonials yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--line-soft)]">
          {testimonials.map((t) => (
            <li key={t.id} className="py-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-mute">
                    “{t.quote.length > 140 ? `${t.quote.slice(0, 140)}…` : t.quote}”
                  </p>
                  <p className="mt-1 font-mono text-xs">
                    {t.name}
                    {t.role ? ` · ${t.role}` : ''} · {'★'.repeat(t.rating)}
                    {t.avatar_url ? ' · avatar' : ''}
                  </p>
                </div>
                <span
                  className={`brutal-flat px-2 py-0.5 font-mono text-[0.6rem] tracking-widest uppercase ${
                    t.status === 'published' ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-mute'
                  }`}
                >
                  {t.status}
                </span>
                <Btn
                  variant="ghost"
                  onClick={() => toggle(t)}
                  aria-label={t.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {t.status === 'published' ? 'HIDE' : 'PUBLISH'}
                </Btn>
                <Btn variant="danger" onClick={() => remove(t)} aria-label={`Delete ${t.name}`}>
                  <Trash2 size={13} />
                </Btn>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export default function AdminContent() {
  return (
    <div className="space-y-6">
      <div>
        <p className="label mb-2">/// CONTENT</p>
        <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
          Skills, experience &amp; testimonials
        </h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SkillsPanel />
        <ExperiencesPanel />
      </div>
      <TestimonialsPanel />
    </div>
  )
}
