import { useEffect, useState } from 'react'

const LINES = [
  { cmd: 'boot portfolio.sys', out: 'modules: projects · writing · stack' },
  { cmd: 'connect rj.verdan.tayam', out: 'status: online' },
]

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function BootIntro() {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem('booted'))
  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(() => REDUCED && !sessionStorage.getItem('booted'))

  useEffect(() => {
    if (!visible) return
    sessionStorage.setItem('booted', '1')
    if (REDUCED) {
      const t = window.setTimeout(() => setVisible(false), 50)
      return () => clearTimeout(t)
    }
    const t1 = window.setTimeout(() => setStep(1), 650)
    const t2 = window.setTimeout(() => setStep(2), 1250)
    const t3 = window.setTimeout(() => setLeaving(true), 1750)
    const t4 = window.setTimeout(() => setVisible(false), 2250)
    return () => [t1, t2, t3, t4].forEach(clearTimeout)
  }, [visible])

  if (!visible) return null

  return (
    <div className={`boot ${leaving ? 'is-done' : ''}`} aria-hidden="true">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-lg px-6">
        <p className="label mb-6">/// r.j. verdan tayam — portfolio</p>
        <div className="space-y-2">
          {LINES.map((line, i) => (
            <div key={line.cmd} className="boot-line" style={{ animationDelay: `${i * 0.55}s` }}>
              <b>&gt; {line.cmd}</b>
              {step > i && <span> — {line.out}</span>}
            </div>
          ))}
        </div>
        <div className="boot-bar mt-8">
          <span />
        </div>
      </div>
    </div>
  )
}
