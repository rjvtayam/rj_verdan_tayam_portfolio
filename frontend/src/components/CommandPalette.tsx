import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search } from 'lucide-react'

type Item = {
  id: string
  label: string
  hint?: string
  run: () => void
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const items = useMemo<Item[]>(() => {
    const go = (path: string) => () => {
      navigate(path)
      onClose()
    }
    return [
      { id: 'home', label: 'Home', hint: 'navigate', run: go('/') },
      { id: 'projects', label: 'Projects', hint: 'navigate', run: go('/projects') },
      { id: 'writing', label: 'Writing', hint: 'navigate', run: go('/writing') },
      { id: 'about', label: 'About', hint: 'navigate', run: go('/about') },
      { id: 'contact', label: 'Contact', hint: 'navigate', run: go('/contact') },
      { id: 'admin', label: 'Admin console', hint: 'navigate', run: go('/admin') },
      {
        id: 'photos',
        label: 'View photos',
        hint: 'action',
        run: () => {
          window.dispatchEvent(new Event('hud:photos'))
          onClose()
        },
      },
      {
        id: 'email',
        label: 'Copy email address',
        hint: 'action',
        run: () => {
          void navigator.clipboard?.writeText('rickyjhon.tayam@gmail.com')
          onClose()
        },
      },
    ]
  }, [navigate, onClose])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.label.toLowerCase().includes(q))
  }, [items, query])

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => (s + 1) % Math.max(1, filtered.length))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => (s - 1 + filtered.length) % Math.max(1, filtered.length))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        filtered[selected]?.run()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, selected, onClose])

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!open) return null

  return (
    <div className="palette-overlay" onClick={onClose} role="presentation">
      <div
        className="palette-box"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={15} className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelected(0)
            }}
            placeholder="type a command…"
            className="w-full bg-transparent font-mono text-sm outline-none placeholder:text-muted"
            aria-label="Command search"
          />
          <kbd className="font-mono text-[0.65rem] text-muted">esc</kbd>
        </div>
        <div ref={listRef} className="max-h-72 overflow-y-auto py-1.5">
          {filtered.length === 0 && (
            <p className="px-4 py-3 font-mono text-sm text-muted">no matches</p>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className="palette-item flex w-full items-center justify-between px-4 py-2.5 text-left"
              aria-selected={i === selected}
              onMouseEnter={() => setSelected(i)}
              onClick={item.run}
            >
              <span className="font-mono text-sm">{item.label}</span>
              <span className="flex items-center gap-2">
                <span className="label">{item.hint}</span>
                {i === selected && <CornerDownLeft size={13} className="text-accent" />}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
