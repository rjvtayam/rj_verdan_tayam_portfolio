import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('en-PH', {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZone: 'Asia/Manila',
})

export default function LocalClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <span className="tabular-nums" title="Philippine Standard Time (UTC+8)">
      {fmt.format(now)} PST
    </span>
  )
}
