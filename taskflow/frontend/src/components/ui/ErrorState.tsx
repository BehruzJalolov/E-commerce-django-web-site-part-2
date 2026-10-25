import { CircleAlert, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  error: unknown
  title?: string
  onRetry?: () => void
  compact?: boolean
  className?: string
}

export function ErrorState({
  error,
  title = 'Something went wrong',
  onRetry,
  compact = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-danger-soft/50 px-6 text-center',
        compact ? 'py-8' : 'py-12',
        className,
      )}
      role="alert"
    >
      <div className="grid size-11 place-items-center rounded-full bg-white text-danger shadow-sm ring-1 ring-red-100">
        <CircleAlert className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-muted">
        {getErrorMessage(error)}
      </p>
      {onRetry ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onRetry}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  )
}
