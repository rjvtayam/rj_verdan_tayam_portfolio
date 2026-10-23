import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export default function OverlayShell({
  onClose,
  label,
  title,
  actions,
  ariaLabel,
  children,
}: {
  onClose: () => void
  label: string
  title: ReactNode
  actions?: ReactNode
  ariaLabel: string
  children: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="palette-overlay overlay-host" onClick={onClose} role="presentation">
      <div
        className="overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        <span aria-hidden="true" className="overlay-corner overlay-corner-tl" />
        <span aria-hidden="true" className="overlay-corner overlay-corner-tr" />
        <span aria-hidden="true" className="overlay-corner overlay-corner-bl" />
        <span aria-hidden="true" className="overlay-corner overlay-corner-br" />

        <header className="overlay-panel-header">
          <div className="min-w-0">
            <p className="label">{label}</p>
            <h2 className="section-title mt-1 text-base sm:text-lg md:text-xl">{title}</h2>
          </div>
          <div className="no-print flex shrink-0 items-center gap-2">
            {actions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="brutal-flat flex h-9 w-9 items-center justify-center bg-bg transition-colors hover:text-accent sm:h-10 sm:w-10"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="overlay-panel-body">{children}</div>
      </div>
    </div>
  )
}
