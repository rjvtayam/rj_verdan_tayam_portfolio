import { useEffect, useState } from 'react'
import { Command, Moon, Sun } from 'lucide-react'

const ACCENTS = [
  { id: 'lime', label: 'lime', color: '#c6ff00' },
  { id: 'cyan', label: 'cyan', color: '#00e5ff' },
  { id: 'magenta', label: 'magenta', color: '#ff2fd0' },
  { id: 'flame', label: 'flame', color: '#ff5c00' },
] as const

export default function ControlDock() {
  const [accent, setAccent] = useState(() => document.documentElement.dataset.accent ?? 'lime')
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'dark')

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem('accent', accent)
    window.dispatchEvent(new Event('accent:changed'))
  }, [accent])

  useEffect(() => {
    const sync = () => {
      setTheme(document.documentElement.dataset.theme ?? 'light')
      setAccent(document.documentElement.dataset.accent ?? 'lime')
    }
    window.addEventListener('theme:changed', sync)
    window.addEventListener('accent:changed', sync)
    return () => {
      window.removeEventListener('theme:changed', sync)
      window.removeEventListener('accent:changed', sync)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    localStorage.setItem('theme', next)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'dark' ? '#0a0a0c' : '#f4f2ec')
    if (!localStorage.getItem('accent')) {
      document.documentElement.dataset.accent = next === 'dark' ? 'lime' : 'flame'
    }
    window.dispatchEvent(new Event('theme:changed'))
  }

  return (
    <div className="control-dock" aria-label="Display controls" role="group">
      <span className="corner tl" aria-hidden="true" />
      <span className="corner tr" aria-hidden="true" />
      <span className="corner bl" aria-hidden="true" />
      <span className="corner br" aria-hidden="true" />

      <p className="dock-caption">Accent</p>
      <div className="flex flex-col items-center gap-2" role="group" aria-label="Accent color">
        {ACCENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="dock-swatch"
            title={`accent: ${item.label}`}
            aria-label={`Use ${item.label} accent`}
            aria-pressed={accent === item.id}
            onClick={() => setAccent(item.id)}
            style={{
              background: item.color,
              boxShadow: accent === item.id ? `0 0 10px ${item.color}` : 'none',
              borderColor: accent === item.id ? 'var(--ink)' : 'var(--line)',
            }}
          />
        ))}
      </div>

      <span className="dock-divider" aria-hidden="true" />
      <p className="dock-caption">Mode</p>
      <button
        type="button"
        className="dock-btn"
        onClick={toggleTheme}
        aria-label="Toggle light and dark mode"
        title="Toggle light / dark"
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      <span className="dock-divider" aria-hidden="true" />
      <p className="dock-caption">Find</p>
      <button
        type="button"
        className="dock-btn"
        onClick={() => window.dispatchEvent(new Event('palette:open'))}
        aria-label="Open command palette"
        title="Command palette (Ctrl/⌘ K)"
      >
        <Command size={15} />
      </button>

      <span className="dock-divider" aria-hidden="true" />
      <span className="dock-status" aria-hidden="true">
        <i /> LIVE
      </span>
    </div>
  )
}
