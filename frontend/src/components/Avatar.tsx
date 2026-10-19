import { useState } from 'react'

const PALETTE = ['#c6ff00', '#00e5ff', '#ff2fd0', '#ff7a00', '#9d6bff', '#2bff96']

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

function hashIndex(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 100000
  return hash % PALETTE.length
}

type Props = {
  name: string
  src?: string | null
  size?: number
  className?: string
}

export default function Avatar({ name, src, size = 44, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  const showImg = Boolean(src) && !failed
  const bg = PALETTE[hashIndex(name)]

  return (
    <span
      className={`avatar ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36), background: showImg ? 'var(--surface-2)' : bg }}
    >
      {showImg ? (
        <img src={src ?? ''} alt={name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        initials(name)
      )}
    </span>
  )
}
