import type { ComponentType, ReactNode } from 'react'
import Reveal from './Reveal'

type Props = {
  label: string
  title: ReactNode
  icon: ComponentType<{ size?: number; className?: string }>
  ghost: string
  kicker?: string
}

export default function PageHero({ label, title, icon: Icon, ghost, kicker }: Props) {
  return (
    <section className="page-hero grid-bg">
      <div className="starfield" aria-hidden="true" />
      <div className="aurora" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <span className="scan-line" aria-hidden="true" />
      <span className="page-hero__ghost" aria-hidden="true">
        {ghost}
      </span>
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <Reveal>
          <span className="chip-icon">
            <Icon size={20} />
          </span>
          <p className="label mt-5 mb-3">/// {label}</p>
          <h1 className="section-title text-[clamp(2.1rem,1.3rem+3.4vw,3.5rem)]">{title}</h1>
          <span className="section-underline" aria-hidden="true" />
          {kicker && <p className="mt-5 max-w-2xl text-base leading-relaxed text-mute">{kicker}</p>}
        </Reveal>
      </div>
    </section>
  )
}
