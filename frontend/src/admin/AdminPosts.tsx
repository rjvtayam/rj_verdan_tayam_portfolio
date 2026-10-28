import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { ApiError } from '../lib/api'
import { formatDate } from '../lib/format'
import { useAdminPosts, usePostMutations } from '../lib/hooks'
import type { Post } from '../lib/types'
import { Btn, ErrorNote, Field, Input, Panel, TextArea } from './ui'

type FormState = {
  slug: string
  title: string
  excerpt: string
  content_md: string
  tags: string
  status: string
}

const EMPTY: FormState = {
  slug: '',
  title: '',
  excerpt: '',
  content_md: '',
  tags: '',
  status: 'published',
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export default function AdminPosts() {
  const { data: posts = [], isLoading } = useAdminPosts(true)
  const mutations = usePostMutations()
  const [editing, setEditing] = useState<Post | 'new' | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const openNew = () => {
    setForm(EMPTY)
    setEditing('new')
    setError(null)
  }

  const openEdit = (p: Post) => {
    setForm({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content_md: p.content_md ?? '',
      tags: p.tags.join(', '),
      status: p.status,
    })
    setEditing(p)
    setError(null)
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const now = new Date().toISOString()
    const body = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      excerpt: form.excerpt,
      content_md: form.content_md,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status: form.status,
      published_at: form.status === 'published' ? now : null,
    }
    try {
      if (editing === 'new') await mutations.create.mutateAsync(body)
      else if (editing) await mutations.update.mutateAsync({ id: editing.id, body })
      setEditing(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    }
  }

  const onDelete = async (p: Post) => {
    if (!window.confirm(`Delete post "${p.title}"?`)) return
    try {
      await mutations.remove.mutateAsync(p.id)
      if (editing === p) setEditing(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label mb-2">/// WRITING</p>
          <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">Manage posts</h1>
        </div>
        {editing === null && (
          <Btn onClick={openNew}>
            <Plus size={14} /> NEW POST
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
                placeholder="Designing responsive layouts on purpose"
              />
            </Field>
            <Field label="SLUG" hint="Leave blank to auto-generate">
              <Input
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="responsive-layouts"
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="EXCERPT">
                <TextArea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => set('excerpt', e.target.value)}
                  placeholder="Short description shown in the list"
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="CONTENT (MARKDOWN)" hint="Supports GFM: tables, code, lists">
                <TextArea
                  rows={14}
                  value={form.content_md}
                  onChange={(e) => set('content_md', e.target.value)}
                  placeholder={'## Heading\n\nParagraph…\n\n```bash\ncommand\n```'}
                  className="font-mono text-[0.8rem] leading-relaxed"
                />
              </Field>
            </div>

            <Field label="TAGS" hint="Comma separated">
              <Input
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="react, css"
              />
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

            <div className="flex gap-3 md:col-span-2">
              <Btn type="submit" disabled={mutations.create.isPending || mutations.update.isPending}>
                SAVE POST
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
        ) : posts.length === 0 ? (
          <p className="p-5 font-mono text-sm text-mute">No posts yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--line-soft)]">
            {posts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="font-mono text-xs text-mute">{String(p.id).padStart(2, '0')}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-bold">{p.title}</p>
                  <p className="font-mono text-[0.68rem] text-mute">
                    {formatDate(p.published_at ?? p.created_at)} · /{p.slug}
                  </p>
                </div>
                <span
                  className={`brutal-flat px-2 py-0.5 font-mono text-[0.6rem] tracking-widest uppercase ${
                    p.status === 'published' ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-mute'
                  }`}
                >
                  {p.status}
                </span>
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
