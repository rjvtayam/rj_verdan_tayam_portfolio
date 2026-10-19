import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, Command, Download, Menu, UserRound, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { RESUMES } from '../lib/resumes'
import AccentSwitcher from './AccentSwitcher'
import ThemeToggle from './ThemeToggle'

const NAV = [
  { to: '/projects', label: 'WORK', index: '01' },
  { to: '/writing', label: 'WRITING', index: '02' },
  { to: '/about', label: 'ABOUT', index: '03' },
  { to: '/contact', label: 'CONTACT', index: '04' },
]

function Monogram() {
  return (
    <Link to="/" aria-label="Home" className="group flex items-center gap-3">
      <span className="brutal-flat flex h-10 w-10 items-center justify-center bg-accent font-mono text-sm font-bold text-accent-ink transition-transform group-hover:-translate-y-0.5">
        RJ
      </span>
      <span className="hidden font-mono text-xs font-bold tracking-[0.2em] sm:block">
        R.J. VERDAN TAYAM
      </span>
    </Link>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `link-underline font-mono text-[0.78rem] font-bold tracking-[0.14em] transition-colors ${
      isActive ? 'text-accent' : 'hover:text-accent'
    }`

  const openPalette = () => window.dispatchEvent(new Event('palette:open'))

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Monogram />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <span className="text-mute">{item.index}/</span>
              {item.label}
            </NavLink>
          ))}
          <div className="flex items-center gap-5 xl:hidden">
            <AccentSwitcher />
            <button
              type="button"
              onClick={openPalette}
              aria-label="Open command palette"
              className="brutal-flat flex h-10 items-center gap-2 bg-surface px-3 font-mono text-xs text-muted transition-colors hover:text-accent"
            >
              <Command size={14} />
              <span className="tracking-widest">⌘K</span>
            </button>
            <ThemeToggle />
          </div>
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            className="brutal-flat flex h-10 w-10 items-center justify-center bg-surface text-muted"
          >
            <Command size={16} />
          </button>
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="brutal-flat flex h-10 w-10 items-center justify-center bg-surface"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 right-0 flex h-full w-[82%] max-w-sm flex-col border-l border-line bg-bg outline-none"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="label">// MENU</span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="brutal-flat flex h-9 w-9 items-center justify-center bg-surface"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex flex-col px-5 py-6" aria-label="Mobile">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.35 }}
                  >
                    <NavLink
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-baseline gap-3 border-b border-line-soft py-4 font-mono text-2xl font-bold tracking-tight ${
                          isActive ? 'text-accent' : 'hover:text-accent'
                        }`
                      }
                    >
                      <span className="text-xs font-normal text-mute">[{item.index}]</span>
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto space-y-4 border-t border-line px-5 py-5">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new Event('hud:profile'))
                      setOpen(false)
                    }}
                    className="brutal brutal-hover flex flex-1 items-center justify-center gap-2 bg-surface px-3 py-3 font-mono text-[0.7rem] font-bold tracking-widest hover:text-accent"
                  >
                    <UserRound size={13} /> PROFILE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(new Event('hud:analytics'))
                      setOpen(false)
                    }}
                    className="brutal brutal-hover flex flex-1 items-center justify-center gap-2 bg-surface px-3 py-3 font-mono text-[0.7rem] font-bold tracking-widest hover:text-accent"
                  >
                    <BarChart3 size={13} /> ANALYTICS
                  </button>
                </div>
                <div className="flex gap-3">
                  {RESUMES.map(({ href, label }) => (
                    <a
                      key={href}
                      href={href}
                      download
                      onClick={() => setOpen(false)}
                      className="brutal brutal-hover flex flex-1 items-center justify-center gap-2 bg-surface px-3 py-3 font-mono text-[0.7rem] font-bold tracking-widest hover:text-accent"
                    >
                      <Download size={13} /> {label}
                    </a>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <p className="label">ACCENT</p>
                  <AccentSwitcher />
                </div>
                <p className="label mb-2">STATUS</p>
                <p className="flex items-center gap-2 font-mono text-sm">
                  <span className="inline-block h-2 w-2 animate-pulse bg-accent" />
                  AVAILABLE FOR WORK
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
