import { Mail, Trash2 } from 'lucide-react'
import { ApiError } from '../lib/api'
import { formatDate } from '../lib/format'
import { useAdminMessages, useMessageMutations } from '../lib/hooks'
import { Btn, ErrorNote, Panel } from './ui'
import { useState } from 'react'

export default function AdminMessages() {
  const { data: messages = [], isLoading } = useAdminMessages(true)
  const mutations = useMessageMutations()
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const visible = filter === 'unread' ? messages.filter((m) => !m.is_read) : messages

  const toggleRead = async (id: number, is_read: boolean) => {
    setError(null)
    try {
      await mutations.markRead.mutateAsync({ id, is_read })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed')
    }
  }

  const onDelete = async (id: number) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await mutations.remove.mutateAsync(id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label mb-2">/// INBOX</p>
          <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">Messages</h1>
        </div>
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`brutal-flat px-3 py-2 font-mono text-[0.68rem] font-bold tracking-widest uppercase ${
                filter === f ? 'bg-accent text-accent-ink' : 'bg-surface hover:border-accent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ErrorNote message={error} />

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-24 animate-pulse bg-surface-2" />
          <div className="h-24 animate-pulse bg-surface-2" />
        </div>
      ) : visible.length === 0 ? (
        <Panel>
          <p className="font-mono text-sm text-mute">No messages here.</p>
        </Panel>
      ) : (
        <div className="space-y-4">
          {visible.map((m) => (
            <Panel key={m.id} className={m.is_read ? '' : 'border-l-4 border-l-accent'}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-mono text-sm font-bold">{m.name}</span>
                  <a
                    href={`mailto:${m.email}`}
                    className="link-underline font-mono text-xs text-mute hover:text-accent"
                  >
                    {m.email}
                  </a>
                </div>
                <span className="label">{formatDate(m.created_at)}</span>
              </div>

              {m.subject && (
                <p className="mt-3 font-mono text-sm font-bold">RE: {m.subject}</p>
              )}
              <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-mute">
                {m.body}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-line-soft pt-4">
                <a
                  href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || 'your message')}`}
                  className="brutal-flat inline-flex items-center gap-2 bg-bg px-3 py-2 font-mono text-[0.68rem] font-bold tracking-widest hover:border-accent"
                >
                  <Mail size={13} /> REPLY
                </a>
                <Btn variant="ghost" onClick={() => toggleRead(m.id, !m.is_read)}>
                  {m.is_read ? 'MARK UNREAD' : 'MARK READ'}
                </Btn>
                <Btn variant="danger" onClick={() => onDelete(m.id)}>
                  <Trash2 size={13} /> DELETE
                </Btn>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}
