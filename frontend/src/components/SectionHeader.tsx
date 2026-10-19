import type { ReactNode } from 'react'
import Reveal from './Reveal'

type Props = {
  label: string
  title: ReactNode
  action?: ReactNode
}

export default function SectionHeader({ label, title, action }: Props) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="label mb-3">/// {label}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      {action}
    </Reveal>
  )
}
