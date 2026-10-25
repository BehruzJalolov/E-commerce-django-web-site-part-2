import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  secondaryAction?: ReactNode
  compact?: boolean
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-white/60 px-6 text-center',
        compact ? 'py-8' : 'py-12',
        className,
      )}
    >
      <div
        className={cn(
          'grid place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100',
          compact ? 'size-10' : 'size-12',
        )}
      >
        <Icon
          className={compact ? 'size-5' : 'size-6'}
          aria-hidden="true"
        />
      </div>
      <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">
        {description}
      </p>
      {action || secondaryAction ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}
