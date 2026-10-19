import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="grid-bg mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
      <p className="label mb-4">/// 404</p>
      <h1 className="display text-[clamp(3.5rem,2rem+10vw,8rem)]">
        4<span className="text-accent">0</span>4
      </h1>
      <div className="mt-6 max-w-md font-mono text-sm text-mute">
        <p>
          <span className="text-accent">$</span> ls ./this-page
        </p>
        <p className="mt-1">→ ls: no such file or directory</p>
      </div>
      <Link
        to="/"
        className="brutal brutal-hover mt-8 inline-flex w-fit items-center gap-2 bg-surface px-5 py-3 font-mono text-sm font-bold tracking-widest"
      >
        ← BACK HOME
      </Link>
    </div>
  )
}
