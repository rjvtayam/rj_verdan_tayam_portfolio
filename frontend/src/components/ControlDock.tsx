import { useEffect, useState } from 'react'
import { Command, Images } from 'lucide-react'

const ACCENTS = [
  { id: 'lime', label: 'lime', color: '#c6ff00' },
  { id: 'cyan', label: 'cyan', color: '#00e5ff' },
  { id: 'magenta', label: 'magenta', color: '#ff2fd0' },
  { id: 'flame', label: 'flame', color: '#ff5c00' },
] as const

export default function ControlDock() {
  const [accent, setAccent] = useState(() => document.documentElement.dataset.accent ?? 'lime')

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    localStorage.setItem('accent', accent)
    window.dispatchEvent(new Event('accent:changed'))
  }, [accent])

  useEffect(() => {
    const sync = () => setAccent(document.documentElement.dataset.accent ?? 'lime')
    window.addEventListener('accent:changed', sync)
    return () => window.removeEventListener('accent:changed', sync)
  }, [])

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
      <p className="dock-caption">Photos</p>
      <button
        type="button"
        className="dock-btn"
        onClick={() => window.dispatchEvent(new Event('hud:photos'))}
        aria-label="View photos"
        title="View photos"
      >
        <Images size={15} />
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
