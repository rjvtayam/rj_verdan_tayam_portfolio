import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Mail, MapPin, Phone, Send } from 'lucide-react'
import { FacebookIcon, GithubIcon, LinkedinIcon } from '../components/SocialIcons'
import Reveal from '../components/Reveal'
import { useSendMessage } from '../lib/hooks'
import { ApiError } from '../lib/api'

const inputClass =
  'w-full border border-line bg-bg px-4 py-3 font-mono text-sm outline-none transition-colors placeholder:text-mute focus:border-accent'

export default function ContactPage() {
  const mutation = useSendMessage()
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' })
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (key: string, text: string) => {
    void navigator.clipboard?.writeText(text)
    setCopied(key)
    window.setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    mutation.mutate(form)
  }

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <Reveal>
        <p className="label mb-3">/// CONTACT</p>
        <h1 className="section-title text-[clamp(2.2rem,1.4rem+3.4vw,3.6rem)]">
          Let&apos;s build <span className="text-accent">something</span>
        </h1>
        <p className="mt-4 max-w-xl text-mute">
          Project inquiries, collaborations or roles — send a message and it lands straight in my
          inbox.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* form / success */}
        <Reveal delay={0.05}>
          {mutation.isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="brutal bg-surface p-8"
            >
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="flex h-8 w-8 items-center justify-center bg-accent text-accent-ink">
                  <Check size={16} />
                </span>
                <span className="font-bold">MESSAGE SENT</span>
              </div>
              <div className="mt-5 space-y-1 font-mono text-sm text-mute">
                <p>
                  <span className="text-accent">$</span> mail --to rjverdan
                </p>
                <p>→ status: delivered</p>
                <p>→ from: {form.email || 'you'}</p>
                <p>→ reply_eta: &lt; 24h</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  mutation.reset()
                  setForm({ name: '', email: '', subject: '', body: '' })
                }}
                className="brutal brutal-hover mt-6 bg-bg px-5 py-3 font-mono text-xs font-bold tracking-widest"
              >
                SEND ANOTHER
              </button>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="brutal space-y-5 bg-surface p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="label mb-2 block">NAME *</span>
                  <input
                    required
                    value={form.name}
                    onChange={set('name')}
                    className={inputClass}
                    placeholder="Ada Lovelace"
                    autoComplete="name"
                  />
                </label>
                <label className="block">
                  <span className="label mb-2 block">EMAIL *</span>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    className={inputClass}
                    placeholder="you@company.com"
                    autoComplete="email"
                  />
                </label>
              </div>

              <label className="block">
                <span className="label mb-2 block">SUBJECT</span>
                <input
                  value={form.subject}
                  onChange={set('subject')}
                  className={inputClass}
                  placeholder="Project inquiry"
                />
              </label>

              <label className="block">
                <span className="label mb-2 block">MESSAGE * (min 10 chars)</span>
                <textarea
                  required
                  minLength={10}
                  rows={6}
                  value={form.body}
                  onChange={set('body')}
                  className={`${inputClass} resize-y`}
                  placeholder="Tell me about what you're building…"
                />
              </label>

              {mutation.isError && (
                <p className="border border-accent bg-bg px-4 py-3 font-mono text-xs text-accent">
                  {mutation.error instanceof ApiError
                    ? mutation.error.message
                    : 'Something went wrong — please try again.'}
                </p>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="brutal brutal-hover inline-flex items-center gap-2 bg-accent px-6 py-3.5 font-mono text-sm font-bold tracking-widest text-accent-ink disabled:opacity-60"
              >
                {mutation.isPending ? 'SENDING…' : 'SEND MESSAGE'}
                <Send size={15} />
              </button>
            </form>
          )}
        </Reveal>

        {/* info */}
        <Reveal delay={0.12} className="space-y-5">
          <div className="brutal-flat bg-surface p-6">
            <p className="label mb-4">DIRECT</p>
            <div className="group flex items-center justify-between gap-3">
              <a
                href="mailto:rickyjhon.tayam@gmail.com"
                className="link-underline inline-flex min-w-0 items-center gap-2 font-mono text-sm hover:text-accent"
              >
                <Mail size={15} className="shrink-0" />
                <span className="truncate">rickyjhon.tayam@gmail.com</span>
              </a>
              <button
                type="button"
                onClick={() => copy('email', 'rickyjhon.tayam@gmail.com')}
                aria-label="Copy email"
                title="Copy email"
                className={`shrink-0 rounded-md p-1.5 transition-colors hover:bg-bg hover:text-accent ${
                  copied === 'email' ? 'text-accent' : 'text-mute'
                }`}
              >
                {copied === 'email' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="group mt-3 flex items-center justify-between gap-3">
              <a
                href="tel:+639661855866"
                className="link-underline inline-flex items-center gap-2 font-mono text-sm hover:text-accent"
              >
                <Phone size={15} /> +63 966 185 5866
              </a>
              <button
                type="button"
                onClick={() => copy('phone', '+639661855866')}
                aria-label="Copy phone number"
                title="Copy phone number"
                className={`shrink-0 rounded-md p-1.5 transition-colors hover:bg-bg hover:text-accent ${
                  copied === 'phone' ? 'text-accent' : 'text-mute'
                }`}
              >
                {copied === 'phone' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="mt-3 flex items-center gap-2 font-mono text-sm text-mute">
              <MapPin size={15} /> Remote · UTC+8
            </p>
            {copied && (
              <p className="mt-4 border border-accent/40 bg-bg px-3 py-2 font-mono text-[0.7rem] tracking-widest text-accent">
                COPIED TO CLIPBOARD ✓
              </p>
            )}
          </div>

          <div className="brutal-flat bg-surface p-6">
            <p className="label mb-4">SOCIAL</p>
            <ul className="space-y-3 font-mono text-sm">
              <li>
                <a
                  href="https://web.facebook.com/rj.tayam"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline inline-flex items-center gap-2 hover:text-accent"
                >
                  <FacebookIcon size={15} /> FACEBOOK
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/rjvtayam"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline inline-flex items-center gap-2 hover:text-accent"
                >
                  <GithubIcon size={15} /> GITHUB
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="link-underline inline-flex items-center gap-2 hover:text-accent"
                >
                  <LinkedinIcon size={15} /> LINKEDIN
                </a>
              </li>
            </ul>
          </div>

          <div className="brutal bg-surface p-6">
            <p className="label mb-3">AVAILABILITY</p>
            <p className="flex items-center gap-2 font-mono text-sm font-bold">
              <span className="inline-block h-2 w-2 animate-pulse bg-accent" />
              OPEN TO NEW PROJECTS
            </p>
            <p className="mt-2 text-sm text-mute">
              Typical reply time under 24 hours on business days.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
