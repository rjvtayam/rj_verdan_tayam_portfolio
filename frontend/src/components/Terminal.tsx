import { useEffect, useState } from 'react'

export type TerminalLine = { cmd: string; out: string }

type Props = {
  lines: TerminalLine[]
  className?: string
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Terminal({ lines, className = '' }: Props) {
  const reduced = prefersReducedMotion()
  const [idx, setIdx] = useState(0)
  const [pos, setPos] = useState(0)
  const [showOut, setShowOut] = useState(false)

  useEffect(() => {
    if (reduced) return
    const current = lines[idx % lines.length]
    let timer: ReturnType<typeof setTimeout>

    if (!showOut && pos < current.cmd.length) {
      timer = setTimeout(() => setPos((p) => p + 1), 48)
    } else if (!showOut) {
      timer = setTimeout(() => setShowOut(true), 380)
    } else {
      timer = setTimeout(() => {
        setShowOut(false)
        setPos(0)
        setIdx((i) => (i + 1) % lines.length)
      }, 2100)
    }
    return () => clearTimeout(timer)
  }, [idx, pos, showOut, lines, reduced])

  const visible: { cmd: string; out: string; typed: string }[] = reduced
    ? lines.map((l) => ({ ...l, typed: l.cmd }))
    : lines.map((line, i) => {
        if (i < idx % lines.length) return { ...line, typed: line.cmd }
        if (i === idx % lines.length) {
          return { ...line, typed: line.cmd.slice(0, pos), out: showOut ? line.out : '' }
        }
        return { ...line, typed: '', out: '' }
      })

  return (
    <div className={`brutal bg-surface ${className}`}>
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[0.68rem] tracking-widest text-mute">
          rjverdan@portfolio:~
        </span>
      </div>
      <div className="min-h-[190px] space-y-2.5 p-5 font-mono text-[0.82rem] leading-relaxed sm:min-h-[210px] sm:text-sm">
        {visible.map((line, i) => (
          <div key={i} className={line.typed || line.out ? 'opacity-100' : 'opacity-0'}>
            <span className="text-accent">$&nbsp;</span>
            <span>{line.typed}</span>
            {i === idx % lines.length && !reduced && !showOut && pos < lines[idx % lines.length].cmd.length && (
              <span className="caret" />
            )}
            {line.out && (
              <>
                <div className="mt-1 text-mute">→ {line.out}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
