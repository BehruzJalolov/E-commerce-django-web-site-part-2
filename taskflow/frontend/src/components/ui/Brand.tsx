import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface BrandProps {
  variant?: 'light' | 'dark'
  to?: string
  className?: string
  showTagline?: boolean
}

export function Brand({
  variant = 'light',
  to = '/',
  className,
  showTagline = false,
}: BrandProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2',
        className,
      )}
      aria-label="TaskFlow home"
    >
      <span className="relative grid size-9 shrink-0 place-items-center rounded-[11px] bg-brand-600 shadow-sm ring-1 ring-white/15 transition-transform duration-200 group-hover:-rotate-3">
        <Check className="size-[19px] text-white" strokeWidth={3} aria-hidden="true" />
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amber-400 ring-2 ring-white" />
      </span>
      <span className="flex flex-col">
        <span
          className={cn(
            'font-display text-[17px] font-extrabold leading-5 tracking-[-0.03em]',
            variant === 'dark' ? 'text-white' : 'text-ink',
          )}
        >
          TaskFlow
        </span>
        {showTagline ? (
          <span
            className={cn(
              'mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em]',
              variant === 'dark' ? 'text-slate-500' : 'text-subtle',
            )}
          >
            Work with clarity
          </span>
        ) : null}
      </span>
    </Link>
  )
}
