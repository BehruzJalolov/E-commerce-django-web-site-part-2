import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SegmentedOption<T extends string> {
  value: T
  label: string
  count?: number
  icon?: ReactNode
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex w-full items-center gap-1 rounded-xl bg-slate-100/80 p-1 sm:w-auto',
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            className={cn(
              'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all duration-150 focus-visible:outline-2 sm:flex-none',
              active
                ? 'bg-surface text-ink shadow-sm ring-1 ring-line'
                : 'text-muted hover:text-ink',
            )}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {option.icon}
            {option.label}
            {typeof option.count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] leading-none',
                  active
                    ? 'bg-slate-100 text-muted'
                    : 'bg-white/70 text-subtle',
                )}
              >
                {option.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
