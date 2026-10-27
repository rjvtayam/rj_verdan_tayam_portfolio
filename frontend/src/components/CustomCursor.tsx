import { useEffect, useRef, useState } from 'react'

const ACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select, summary'

export default function CustomCursor() {
  const [enabled] = useState(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return fine && !reduced && window.innerWidth >= 1024
  })
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('cursor-fx')

    let x = -100
    let y = -100
    let rx = -100
    let ry = -100
    let raf = 0
    let idle = false

    // Runs only while the ring is catching up; once settled the loop stops
    // entirely (a permanent rAF was burning a core for a static cursor).
    const render = () => {
      rx += (x - rx) * 0.22
      ry += (y - ry) * 0.22
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      const dx = x - rx
      const dy = y - ry
      if (dx * dx + dy * dy < 0.25) {
        idle = true
        raf = 0
        return
      }
      raf = requestAnimationFrame(render)
    }
    const wake = () => {
      if (!idle) return
      idle = false
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    const onMove = (e: MouseEvent) => {
      x = e.clientX
      y = e.clientY
      wake()
      const active = e.target instanceof Element && e.target.closest(ACTIVE_SELECTOR)
      ringRef.current?.classList.toggle('is-active', Boolean(active))
    }
    const onDown = () => ringRef.current?.classList.add('is-down')
    const onUp = () => ringRef.current?.classList.remove('is-down')

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.documentElement.classList.remove('cursor-fx')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
