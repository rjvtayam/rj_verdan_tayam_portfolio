import type { ComponentType, ReactNode } from 'react'
import Reveal from './Reveal'

type Props = {
  label: string
  title: ReactNode
  action?: ReactNode
  icon?: ComponentType<{ size?: number; className?: string }>
}

export default function SectionHeader({ label, title, action, icon: Icon }: Props) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-3 flex items-center gap-3">
          {Icon && (
            <span className="chip-icon chip-icon--sm">
              <Icon size={16} />
            </span>
          )}
          <p className="label">/// {label}</p>
        </div>
        <h2 className="section-title">{title}</h2>
        <span className="section-underline" aria-hidden="true" />
      </div>
      {action}
    </Reveal>
  )
}
