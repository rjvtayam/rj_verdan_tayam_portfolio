import { useEffect, useRef, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    const update = () => {
      raf.current = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0)
    }
    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [])

  return <div className="reading-progress" style={{ width: `${progress}%` }} aria-hidden="true" />
}
