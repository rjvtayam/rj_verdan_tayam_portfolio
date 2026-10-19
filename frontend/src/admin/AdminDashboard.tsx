import { ArrowUpRight, FolderKanban, Inbox, Newspaper, PenLine, Quote, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/format'
import { useAdminMessages, useAdminStats } from '../lib/hooks'
import { Panel } from './ui'

export default function AdminDashboard() {
  const { data: stats } = useAdminStats(true)
  const { data: messages = [] } = useAdminMessages(true)
  const unread = messages.filter((m) => !m.is_read).slice(0, 3)

  const cells = [
    { label: 'PROJECTS', value: stats?.projects, to: '/admin/projects', Icon: FolderKanban },
    { label: 'PUBLISHED', value: stats?.published_projects, to: '/admin/projects', Icon: Sparkles },
    { label: 'POSTS', value: stats?.posts, to: '/admin/posts', Icon: PenLine },
    { label: 'UNREAD', value: stats?.unread_messages, to: '/admin/messages', Icon: Inbox },
    { label: 'MESSAGES', value: stats?.messages, to: '/admin/messages', Icon: Newspaper },
    { label: 'SKILLS', value: stats?.skills, to: '/admin/content', Icon: FolderKanban },
    { label: 'TESTIMONIALS', value: stats?.testimonials, to: '/admin/content', Icon: Quote },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="label mb-2">/// OVERVIEW</p>
        <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
        {cells.map(({ label, value, to, Icon }) => (
          <Link key={label} to={to} className="brutal-flat group bg-surface p-4 hover:border-accent">
            <Icon size={15} className="text-mute group-hover:text-accent" />
            <p className="mt-3 font-mono text-3xl font-bold">{value ?? '—'}</p>
            <p className="label mt-1">{label}</p>
          </Link>
        ))}
      </div>

      <Panel>
        <div className="mb-4 flex items-center justify-between">
          <p className="label">LATEST MESSAGES</p>
          <Link
            to="/admin/messages"
            className="link-underline inline-flex items-center gap-1 font-mono text-xs font-bold tracking-widest hover:text-accent"
          >
            OPEN INBOX <ArrowUpRight size={13} />
          </Link>
        </div>

        {unread.length === 0 ? (
          <p className="font-mono text-sm text-mute">No unread messages. Inbox is clear.</p>
        ) : (
          <ul className="divide-y divide-[var(--line-soft)]">
            {unread.map((m) => (
              <li key={m.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
                <span className="font-mono text-sm font-bold">{m.name}</span>
                <span className="font-mono text-xs text-mute">{m.email}</span>
                <span className="text-sm text-mute">{m.subject || m.body.slice(0, 60)}</span>
                <span className="label ml-auto">{formatDate(m.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
