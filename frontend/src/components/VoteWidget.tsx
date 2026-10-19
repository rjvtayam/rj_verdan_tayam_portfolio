import { useState } from 'react'
import { useVoteProject } from '../lib/hooks'
import StarRating from './StarRating'

type Props = {
  projectId: number
  initialAvg: number | null
  initialCount: number
}

function storageKey(projectId: number): string {
  return `vote:${projectId}`
}

export default function VoteWidget({ projectId, initialAvg, initialCount }: Props) {
  const [myVote, setMyVote] = useState<number | null>(() => {
    const stored = Number(localStorage.getItem(storageKey(projectId)))
    return stored >= 1 && stored <= 5 ? stored : null
  })
  const [stats, setStats] = useState({
    avg: initialAvg ?? 0,
    count: initialCount,
  })
  const vote = useVoteProject()

  const rate = (value: number) => {
    vote.mutate(
      { projectId, value },
      {
        onSuccess: (data) => {
          setStats({ avg: data.rating_avg, count: data.rating_count })
          setMyVote(value)
          localStorage.setItem(storageKey(projectId), String(value))
        },
      },
    )
  }

  return (
    <div className="neon-card p-5">
      <p className="label mb-3">Rate this project</p>
      <div className="flex flex-wrap items-center gap-3">
        <StarRating value={myVote ?? 0} onChange={rate} size={26} />
        <span className="font-mono text-sm text-muted">
          {stats.count > 0
            ? `${stats.avg.toFixed(1)} / 5 · ${stats.count} visitor${stats.count === 1 ? '' : 's'}`
            : 'Be the first to rate'}
        </span>
      </div>
      <p className="mt-3 font-mono text-xs text-muted" aria-live="polite">
        {vote.isPending
          ? 'submitting…'
          : myVote
            ? `your vote: ${myVote}★ — change it any time`
            : 'click a star to vote (anonymous)'}
        {vote.isError && ' — vote failed, try again'}
      </p>
    </div>
  )
}
