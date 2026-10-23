import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { PHOTOS } from '../lib/profile'
import OverlayShell from './OverlayShell'

export default function PhotosOverlay({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState<number | null>(null)
  const [broken, setBroken] = useState<Set<number>>(() => new Set())
  const total = PHOTOS.length

  useEffect(() => {
    if (active === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        e.preventDefault()
        setActive(null)
      }
      if (e.key === 'ArrowLeft') setActive((i) => (i === null ? null : (i - 1 + total) % total))
      if (e.key === 'ArrowRight') setActive((i) => (i === null ? null : (i + 1) % total))
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [active, total])

  const step = (dir: 1 | -1) =>
    setActive((i) => (i === null ? null : (i + dir + total) % total))

  const current = active !== null ? PHOTOS[active] : undefined

  return (
    <OverlayShell
      onClose={onClose}
      label="/// GALLERY · OWNER PHOTOS"
      title="Photos"
      ariaLabel="Photo gallery of Ricky Jhon V. Tayam"
      actions={
        <span className="brutal-flat hidden items-center gap-2 bg-bg px-3 py-2 font-mono text-[0.62rem] tracking-widest text-mute sm:inline-flex">
          <Camera size={12} className="text-accent" />
          {total > 0 ? `${total} PHOTO${total === 1 ? '' : 'S'}` : 'EMPTY'}
        </span>
      }
    >
      {total === 0 ? (
        <div className="flex min-h-[42vh] flex-col items-center justify-center gap-4 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-bg text-accent">
            <Camera size={26} />
          </span>
          <p className="label">photos coming soon</p>
          <p className="max-w-sm px-2 font-mono text-[0.7rem] leading-relaxed text-mute">
            drop images into <b className="text-ink">frontend/public/photos/</b> and list them in{' '}
            <b className="text-ink">src/lib/profile.ts</b> — they will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {PHOTOS.map((photo, i) => (
            <button
              key={photo.src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}${photo.caption ? `: ${photo.caption}` : ''}`}
              className={`group relative overflow-hidden rounded-xl border border-line bg-bg outline-none transition-colors focus-visible:border-accent ${
                broken.has(i) ? 'aspect-[4/3]' : ''
              }`}
            >
              {broken.has(i) ? (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 text-mute">
                  <Camera size={20} />
                  <span className="font-mono text-[0.6rem] tracking-widest">IMAGE UNAVAILABLE</span>
                </div>
              ) : (
                <>
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={photo.src}
                      alt={photo.caption ?? `Photo of Ricky Jhon V. Tayam ${i + 1}`}
                      loading="lazy"
                      onError={() => setBroken((s) => new Set(s).add(i))}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/35 group-hover:opacity-100">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur">
                      <ZoomIn size={16} />
                    </span>
                  </span>
                </>
              )}
              {photo.caption && (
                <span className="block truncate border-t border-line px-3 py-2 text-left font-mono text-[0.65rem] tracking-widest text-mute">
                  {photo.caption}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* lightbox */}
      <AnimatePresence>
        {current && !broken.has(active ?? -1) && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            onClick={() => setActive(null)}
          >
            <div
              className="relative flex max-h-full w-full max-w-4xl flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={current.src}
                  src={current.src}
                  alt={current.caption ?? 'Ricky Jhon V. Tayam'}
                  draggable={false}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="max-h-[74vh] w-auto max-w-full rounded-xl border border-line object-contain"
                />
              </AnimatePresence>
              {current.caption && (
                <p className="text-center font-mono text-[0.7rem] tracking-widest text-white/80">
                  {current.caption}
                </p>
              )}
              <p className="font-mono text-[0.62rem] tracking-widest text-white/45">
                {(active ?? 0) + 1} / {total}
              </p>
              {total > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous photo"
                    className="absolute top-1/2 left-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur transition hover:border-accent hover:text-accent"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next photo"
                    className="absolute top-1/2 right-0 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur transition hover:border-accent hover:text-accent"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close photo viewer"
                className="absolute -top-1 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur transition hover:border-accent hover:text-accent sm:-top-2"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OverlayShell>
  )
}
