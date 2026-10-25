import { ArrowLeft, Compass, LayoutDashboard } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Brand } from '@/components/ui/Brand'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Page not found')
  const { isAuthenticated, isInitializing } = useAuth()

  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas">
      <div
        className="landing-grid pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <header className="relative flex h-[68px] items-center px-5 sm:px-8">
        <Brand />
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-brand-100 bg-brand-50 text-brand-600 shadow-sm">
            <Compass className="size-7" aria-hidden="true" />
          </div>
          <p className="mt-6 font-display text-[64px] font-extrabold leading-none tracking-[-0.06em] text-ink sm:text-[80px]">
            404
          </p>
          <h1 className="mt-3 text-balance font-display text-2xl font-extrabold tracking-[-0.035em] text-ink sm:text-3xl">
            This page is not on the map.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted">
            The link may be outdated, or the page may have moved. Your projects
            and tasks are still exactly where you left them.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            {isInitializing ? (
              <>
                <Button asChild>
                  <Link to="/">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Go home
                  </Link>
                </Button>
              </>
            ) : isAuthenticated ? (
              <>
                <Button asChild>
                  <Link to="/app">
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    Go to dashboard
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link to="/app/tasks">View tasks</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link to="/">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back to home
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="relative px-6 pb-6 text-center text-[11px] text-subtle">
        © {new Date().getFullYear()} TaskFlow. Plan clearly. Finish calmly.
      </footer>
    </div>
  )
}
