import { AlertCircle, ArrowRight, Inbox, RefreshCw } from 'lucide-react'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { Component, type ErrorInfo, type ReactNode } from 'react'
export function EmptyState({
  title = 'Nothing here just yet',
  description = 'Try a different search or adjust your filters.',
  action,
  onAction,
}: {
  title?: string
  description?: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Inbox size={26} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && (
        <button className="button secondary" onClick={onAction}>
          {action}
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  )
}
export function LoadingState() {
  return (
    <div aria-label="Loading workspace" aria-busy="true" className="loading-layout">
      <div className="skeleton skeleton-title" />
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
      <div className="skeleton skeleton-chart" />
      <div className="skeleton skeleton-chart" />
    </div>
  )
}
export function ErrorState({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle size={32} />
      <h2>We couldn’t load your workspace</h2>
      <p>{error.message}</p>
      <button className="button primary" onClick={retry}>
        <RefreshCw size={16} />
        Try again
      </button>
    </div>
  )
}
class Boundary extends Component<
  { children: ReactNode; onReset: () => void },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NEXUS rendering error', error, info.componentStack)
  }
  render() {
    return this.state.error ? (
      <ErrorState
        error={this.state.error}
        retry={() => {
          this.props.onReset()
          this.setState({ error: null })
        }}
      />
    ) : (
      this.props.children
    )
  }
}
export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { reset } = useQueryErrorResetBoundary()
  return <Boundary onReset={reset}>{children}</Boundary>
}
