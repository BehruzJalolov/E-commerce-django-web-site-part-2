import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

const toneStyles: Record<BadgeTone, string> = {
  neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  brand: 'border-brand-200 bg-brand-50 text-brand-700',
  success: 'border-emerald-200 bg-positive-soft text-positive',
  warning: 'border-amber-200 bg-warning-soft text-warning',
  danger: 'border-red-200 bg-danger-soft text-danger',
  info: 'border-sky-200 bg-info-soft text-info',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  dot?: string
}

export function Badge({
  tone = 'neutral',
  dot,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-5',
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          className={cn('size-1.5 rounded-full', dot)}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  )
}
