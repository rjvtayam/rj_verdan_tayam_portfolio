import { useRef, useState } from 'react'
import { Check, ImagePlus, Quote, Send, X } from 'lucide-react'
import { useSubmitTestimonial, useTestimonials } from '../lib/hooks'
import type { TestimonialInput } from '../lib/types'
import Avatar from './Avatar'
import Reveal from './Reveal'
import SectionHeader from './SectionHeader'
import StarRating from './StarRating'

const NEON = ['var(--neon-1)', 'var(--neon-2)', 'var(--neon-3)', 'var(--neon-4)', 'var(--neon-5)', 'var(--neon-6)']
const MAX_AVATAR = 2 * 1024 * 1024

function initialsColor(name: string): string {
  return NEON[name.length % NEON.length]
}

export default function TestimonialsSection() {
  const { data: testimonials = [], isLoading } = useTestimonials()
  const submit = useSubmitTestimonial()
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState<TestimonialInput>({ name: '', role: '', quote: '', rating: 5 })
  const [avatar, setAvatar] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<TestimonialInput>) => setForm((f) => ({ ...f, ...patch }))

  const onFile = (file: File | null) => {
    if (file && file.size > MAX_AVATAR) {
      setError('avatar must be 2MB or smaller')
      setAvatar(null)
      return
    }
    setError(null)
    setAvatar(file)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await submit.mutateAsync({ data: form, avatar })
      setDone(true)
      setForm({ name: '', role: '', quote: '', rating: 5 })
      setAvatar(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong')
    }
  }

  return (
    <section id="testimonials" className="border-t border-line py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeader
          label="Testimonials"
          icon={Quote}
          title="What collaborators say"
          action={
            <button
              type="button"
              onClick={() => {
                setOpen((v) => !v)
                setDone(false)
              }}
              className="brutal brutal-hover bg-accent px-5 py-2.5 font-mono text-xs font-bold tracking-widest text-accent-ink uppercase"
            >
              {open ? 'close form' : 'leave a testimonial'}
            </button>
          }
        />

        {open && (
          <Reveal className="mb-12">
            {done ? (
              <div className="neon-card flex items-center gap-4 p-6" style={{ ['--card-neon' as string]: 'var(--neon-6)' }}>
                <span className="neon-dot inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ ['--card-neon' as string]: 'var(--neon-6)' }}>
                  <Check size={18} />
                </span>
                <div>
                  <p className="font-mono text-sm font-bold">testimonial received</p>
                  <p className="text-sm text-mute">Thanks — it shows up on this page right away.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-mute transition-colors hover:bg-bg hover:text-ink"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="neon-card grid gap-4 p-6 md:grid-cols-2" style={{ ['--card-neon' as string]: 'var(--neon-2)' }}>
                <div>
                  <label className="label mb-2 block" htmlFor="t-name">Name *</label>
                  <input
                    id="t-name"
                    required
                    minLength={2}
                    maxLength={200}
                    value={form.name}
                    onChange={(e) => set({ name: e.target.value })}
                    className="w-full border border-line bg-surface-2 px-3 py-2.5 font-mono text-sm outline-none focus:border-[var(--neon-2)]"
                    placeholder="Jane Dela Cruz"
                  />
                </div>
                <div>
                  <label className="label mb-2 block" htmlFor="t-role">Role / company</label>
                  <input
                    id="t-role"
                    maxLength={200}
                    value={form.role}
                    onChange={(e) => set({ role: e.target.value })}
                    className="w-full border border-line bg-surface-2 px-3 py-2.5 font-mono text-sm outline-none focus:border-[var(--neon-2)]"
                    placeholder="CTO, Acme Inc."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label mb-2 block" htmlFor="t-quote">Quote *</label>
                  <textarea
                    id="t-quote"
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    value={form.quote}
                    onChange={(e) => set({ quote: e.target.value })}
                    className="w-full resize-y border border-line bg-surface-2 px-3 py-2.5 font-mono text-sm outline-none focus:border-[var(--neon-2)]"
                    placeholder="Working with R.J. was…"
                  />
                </div>
                <div>
                  <span className="label mb-2 block">Rating *</span>
                  <StarRating value={form.rating} onChange={(rating) => set({ rating })} size={26} />
                </div>
                <div>
                  <span className="label mb-2 block">Avatar (optional, ≤2MB)</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                    id="t-avatar"
                  />
                  <button type="button" onClick={() => fileRef.current?.click()} className="file-chip flex items-center gap-2">
                    <ImagePlus size={14} />
                    {avatar ? avatar.name : 'choose image'}
                  </button>
                </div>
                {error && (
                  <p className="font-mono text-xs text-[var(--neon-3)] md:col-span-2" role="alert">
                    {error}
                  </p>
                )}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={submit.isPending}
                    className="brutal brutal-hover inline-flex items-center gap-2 bg-accent px-6 py-3 font-mono text-xs font-bold tracking-widest text-accent-ink uppercase disabled:opacity-60"
                  >
                    <Send size={14} />
                    {submit.isPending ? 'sending…' : 'submit testimonial'}
                  </button>
                </div>
              </form>
            )}
          </Reveal>
        )}

        {isLoading ? (
          <p className="font-mono text-sm text-mute">loading testimonials…</p>
        ) : testimonials.length === 0 ? (
          <p className="font-mono text-sm text-mute">no testimonials yet — be the first.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.06}>
                <article
                  className="neon-card flex h-full flex-col gap-4 p-6"
                  style={{ ['--card-neon' as string]: NEON[i % NEON.length] }}
                >
                  <StarRating value={t.rating} size={15} />
                  <p className="flex-1 text-[0.98rem] leading-relaxed text-ink">“{t.quote}”</p>
                  <footer className="flex items-center gap-3 border-t border-line pt-4">
                    <Avatar name={t.name} src={t.avatar_url} size={40} />
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-bold">{t.name}</p>
                      <p className="truncate text-xs text-mute">{t.role || 'client'}</p>
                    </div>
                    <span
                      className="neon-dot ml-auto h-2 w-2 rounded-full"
                      style={{ ['--card-neon' as string]: initialsColor(t.name) }}
                      aria-hidden="true"
                    />
                  </footer>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
