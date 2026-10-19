import { useEffect } from 'react'
import { LayoutDashboard, LogOut, Newspaper, FolderKanban, PenLine, Inbox } from 'lucide-react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { api, tokenStore } from '../lib/api'
import { useQuery } from '@tanstack/react-query'

const TABS = [
  { to: '/admin', label: 'DASHBOARD', Icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'PROJECTS', Icon: FolderKanban },
  { to: '/admin/posts', label: 'POSTS', Icon: PenLine },
  { to: '/admin/content', label: 'CONTENT', Icon: Newspaper },
  { to: '/admin/messages', label: 'INBOX', Icon: Inbox },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const hasToken = Boolean(tokenStore.get())

  const me = useQuery({
    queryKey: ['admin', 'me'],
    queryFn: api.auth.me,
    enabled: hasToken,
    retry: false,
  })

  useEffect(() => {
    const onExpired = () => navigate('/admin/login', { replace: true })
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [navigate])

  useEffect(() => {
    if (me.isError) navigate('/admin/login', { replace: true })
  }, [me.isError, navigate])

  if (!hasToken) return <Navigate to="/admin/login" replace />
  if (me.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center font-mono text-sm text-mute">
        verifying session…
      </div>
    )
  }

  const logout = () => {
    tokenStore.clear()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center bg-accent font-mono text-xs font-bold text-accent-ink">
              RJ
            </span>
            <span className="font-mono text-xs font-bold tracking-[0.18em]">ADMIN CONSOLE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-[0.68rem] tracking-widest text-mute sm:inline">
              {me.data?.email}
            </span>
            <button
              type="button"
              onClick={logout}
              className="brutal-flat inline-flex items-center gap-2 bg-surface px-3 py-2 font-mono text-[0.68rem] font-bold tracking-widest hover:border-accent"
            >
              <LogOut size={13} /> LOG OUT
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6" aria-label="Admin">
          {TABS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-2 border px-3 py-2 font-mono text-[0.68rem] font-bold tracking-widest transition-colors ${
                  isActive
                    ? 'border-line bg-accent text-accent-ink'
                    : 'border-transparent text-mute hover:text-accent'
                }`
              }
            >
              <Icon size={13} /> {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
