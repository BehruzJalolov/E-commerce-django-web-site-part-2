import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('skeleton rounded-lg', className)}
      aria-hidden="true"
    />
  )
}

export function PageLoading({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted">
      <LoaderCircle
        className="size-6 animate-spin text-brand-600"
        aria-hidden="true"
      />
      <p className="text-sm font-medium">{label}…</p>
    </div>
  )
}

export function InlineLoading({ label = 'Loading' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-muted">
      <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
      {label}
    </span>
  )
}
