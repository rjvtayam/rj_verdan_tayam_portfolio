import { useState } from 'react'

type Props = {
  value: number
  onChange?: (value: number) => void
  size?: number
  count?: number
  className?: string
}

export default function StarRating({ value, onChange, size = 16, count, className = '' }: Props) {
  const [hovered, setHovered] = useState(0)
  const shown = hovered || value
  const interactive = Boolean(onChange)

  const stars = [1, 2, 3, 4, 5].map((star) => {
    const on = star <= Math.round(shown)
    const body = (
      <span className={`star ${on ? 'is-on' : ''}`} style={{ fontSize: size }}>
        ★
      </span>
    )
    if (!interactive) return <span key={star}>{body}</span>
    return (
      <button
        key={star}
        type="button"
        className="star-btn"
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        onMouseEnter={() => setHovered(star)}
        onMouseLeave={() => setHovered(0)}
        onFocus={() => setHovered(star)}
        onBlur={() => setHovered(0)}
        onClick={() => onChange?.(star)}
      >
        {body}
      </button>
    )
  })

  return (
    <span
      className={`inline-flex items-center gap-[3px] ${className}`}
      role={interactive ? undefined : 'img'}
      aria-label={interactive ? undefined : `Rating ${value} out of 5`}
      onMouseLeave={() => setHovered(0)}
    >
      {stars}
      {count !== undefined && (
        <span className="ml-1.5 font-mono text-[0.7rem] text-muted">
          {count === 0 ? 'no votes yet' : `${value.toFixed(1)} · ${count} vote${count === 1 ? '' : 's'}`}
        </span>
      )}
    </span>
  )
}
