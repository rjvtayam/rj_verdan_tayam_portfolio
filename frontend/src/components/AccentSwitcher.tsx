import { useEffect, useState } from 'react'

const ACCENTS = [
  { id: 'lime', label: 'lime', color: '#c6ff00' },
  { id: 'cyan', label: 'cyan', color: '#00e5ff' },
  { id: 'magenta', label: 'magenta', color: '#ff2fd0' },
  { id: 'flame', label: 'flame', color: '#ff5c00' },
] as const

export default function AccentSwitcher() {
  const [accent, setAccent] = useState<string>(
    () => document.documentElement.dataset.accent ?? 'lime',
  )

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
    <div
      className="brutal-flat flex items-center gap-1.5 bg-surface px-2.5 py-2"
      role="group"
      aria-label="Accent color"
    >
      {ACCENTS.map((item) => (
        <button
          key={item.id}
          type="button"
          title={`accent: ${item.label}`}
          aria-label={`Use ${item.label} accent`}
          aria-pressed={accent === item.id}
          onClick={() => setAccent(item.id)}
          className={`h-3.5 w-3.5 rounded-full border transition-transform ${
            accent === item.id ? 'scale-110 border-ink' : 'border-line hover:scale-110'
          }`}
          style={{ background: item.color, boxShadow: accent === item.id ? `0 0 8px ${item.color}` : 'none' }}
        />
      ))}
    </div>
  )
}
