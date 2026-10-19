import { useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

type Props = {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  className?: string
}

export default function CountUp({ value, duration = 1.4, decimals = 0, suffix = '', className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState(() => (REDUCED ? value : 0))

  useEffect(() => {
    if (!inView || REDUCED) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000))
      setDisplay(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
