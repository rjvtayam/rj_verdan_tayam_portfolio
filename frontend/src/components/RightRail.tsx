import { useEffect, useRef, useState } from 'react'
import { BarChart3, Download, UserRound } from 'lucide-react'
import { RESUMES } from '../lib/resumes'

const openProfile = () => window.dispatchEvent(new Event('hud:profile'))
const openAnalytics = () => window.dispatchEvent(new Event('hud:analytics'))

export default function RightRail() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <aside
      aria-label="Profile and downloads"
      className="fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 xl:block"
    >
      <div ref={wrapRef} className="control-dock relative">
        <span className="corner tl" aria-hidden="true" />
        <span className="corner tr" aria-hidden="true" />
        <span className="corner bl" aria-hidden="true" />
        <span className="corner br" aria-hidden="true" />

        <p className="dock-caption">YOU</p>
        <button
          type="button"
          className="dock-btn"
          onClick={openProfile}
          aria-label="Open profile"
          title="Profile"
        >
          <UserRound size={15} />
        </button>
        <button
          type="button"
          className="dock-btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Download resume"
          title="Download resume"
        >
          <Download size={15} />
        </button>
        <button
          type="button"
          className="dock-btn"
          onClick={openAnalytics}
          aria-label="Open analytics dashboard"
          title="Analytics"
        >
          <BarChart3 size={15} />
        </button>

        <span className="dock-divider" aria-hidden="true" />
        <span className="dock-status" aria-hidden="true">
          <i /> DL
        </span>

        {open && (
          <div className="resume-flyout from-right" role="menu" aria-label="Resume downloads">
            {RESUMES.map(({ href, label, hint, Icon }) => (
              <a
                key={href}
                href={href}
                download
                role="menuitem"
                className="resume-flyout-item"
                onClick={() => setOpen(false)}
              >
                <Icon size={15} className="shrink-0" />
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[0.7rem] font-bold tracking-widest">
                    {label}
                  </span>
                  <span className="dock-caption block">{hint}</span>
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
