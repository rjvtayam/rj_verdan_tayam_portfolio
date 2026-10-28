import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // surface render crashes in devtools/analytics instead of failing silently
    console.error('Render crash caught by ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid-bg flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-accent">
            <AlertTriangle size={22} />
          </span>
          <h1 className="section-title text-2xl">Something broke</h1>
          <p className="max-w-md font-mono text-sm leading-relaxed text-mute">
            {this.state.error.message || 'Unexpected application error.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="brutal brutal-hover mt-2 bg-surface px-5 py-3 font-mono text-xs font-bold tracking-widest"
          >
            RELOAD HOME
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
