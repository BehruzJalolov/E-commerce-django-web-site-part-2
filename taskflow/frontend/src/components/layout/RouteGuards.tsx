import { LoaderCircle, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { Brand } from '@/components/ui/Brand'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { getErrorMessage } from '@/lib/errors'

function AuthSplash() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-canvas">
      <Brand />
      <div className="flex items-center gap-2 text-sm text-muted">
        <LoaderCircle className="size-4 animate-spin text-brand-600" aria-hidden="true" />
        Preparing your workspace…
      </div>
    </div>
  )
}

function SessionError({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas p-6">
      <Brand />
      <div className="mt-8 w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
        <div className="mx-auto grid size-11 place-items-center rounded-full bg-danger-soft text-danger">
          <ShieldAlert className="size-5" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-ink">
          We could not verify your session
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {getErrorMessage(error)}
        </p>
        <Button className="mt-5" onClick={retry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isInitializing, isAuthenticated, authError, retryAuth } = useAuth()
  const location = useLocation()

  if (isInitializing) return <AuthSplash />
  if (authError) return <SessionError error={authError} retry={retryAuth} />

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <>{children}</>
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { isInitializing, isAuthenticated } = useAuth()

  if (isInitializing) return <AuthSplash />
  if (isAuthenticated) return <Navigate to="/app" replace />

  return <>{children}</>
}
