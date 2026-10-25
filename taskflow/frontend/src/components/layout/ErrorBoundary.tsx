import { CircleAlert, RefreshCw } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Brand } from '@/components/ui/Brand'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas p-6">
        <Brand />
        <div className="mt-8 w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
          <div className="mx-auto grid size-11 place-items-center rounded-full bg-danger-soft text-danger">
            <CircleAlert className="size-5" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-lg font-bold text-ink">
            Something unexpected happened
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            The interface ran into an error. Your saved work is safe on the
            server. Reload the page to continue.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <Button
              onClick={() => {
                window.location.reload()
              }}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Reload page
            </Button>
            <Button variant="secondary" asChild>
              <a href="/">Go home</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
