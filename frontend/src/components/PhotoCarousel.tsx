import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react'

type Photo = { src: string; caption?: string }

export default function PhotoCarousel({ photos }: { photos: Photo[] }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [broken, setBroken] = useState<Set<number>>(() => new Set())
  const total = photos.length

  const go = (dir: 1 | -1) => {
    if (total === 0) return
    setIdx((i) => (i + dir + total) % total)
  }

  useEffect(() => {
    if (total < 2 || paused) return
    const t = setInterval(() => setIdx((i) => (i + 1) % total), 4200)
    return () => clearInterval(t)
  }, [total, paused])

  const boxRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  const current = photos[idx]
  const currentBroken = broken.has(idx)

  return (
    <div
      ref={boxRef}
      tabIndex={0}
      role="region"
      aria-label="Photo carousel"
      className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-surface-2 outline-none focus-visible:border-accent"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {total === 0 || !current || currentBroken ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-bg text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface text-accent">
            <Camera size={22} />
          </span>
          <p className="label">photos coming soon</p>
          <p className="max-w-[16rem] px-4 font-mono text-[0.65rem] leading-relaxed text-mute">
            drop your photos into <b className="text-ink">public/media/</b> and list them in{' '}
            <b className="text-ink">lib/profile.ts</b>
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.img
            key={current.src}
            src={current.src}
            alt={current.caption ?? 'R.J. Verdan Tayam'}
            draggable={false}
            onError={() => setBroken((s) => new Set(s).add(idx))}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      )}

      {current?.caption && total > 0 && !currentBroken && (
        <p className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/75 to-transparent px-4 pt-10 pb-7 font-mono text-[0.68rem] tracking-widest text-white">
          {current.caption}
        </p>
      )}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="absolute top-1/2 left-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/80 opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg/80 opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                onClick={() => setIdx(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === idx ? 18 : 6,
                  background: i === idx ? 'var(--accent)' : 'var(--line)',
                  boxShadow: i === idx ? '0 0 8px var(--accent)' : 'none',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
