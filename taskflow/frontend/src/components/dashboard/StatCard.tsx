import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn, formatNumber } from '@/lib/utils'

const toneStyles = {
  brand: {
    icon: 'bg-brand-50 text-brand-600 ring-brand-100',
    accent: 'group-hover:border-brand-200',
  },
  sky: {
    icon: 'bg-info-soft text-info ring-sky-100',
    accent: 'group-hover:border-sky-200',
  },
  emerald: {
    icon: 'bg-positive-soft text-positive ring-emerald-100',
    accent: 'group-hover:border-emerald-200',
  },
  rose: {
    icon: 'bg-danger-soft text-danger ring-red-100',
    accent: 'group-hover:border-red-200',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-600 ring-slate-200',
    accent: 'group-hover:border-slate-300',
  },
}

interface StatCardProps {
  label: string
  value: number
  detail: string
  icon: LucideIcon
  tone: keyof typeof toneStyles
  to: string
}

export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  to,
}: StatCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-float/30',
        toneStyles[tone].accent,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
            {label}
          </p>
          <p className="mt-2.5 font-display text-[30px] font-extrabold leading-none tracking-[-0.04em] text-ink">
            {formatNumber(value)}
          </p>
        </div>
        <span
          className={cn(
            'grid size-9 place-items-center rounded-xl ring-1',
            toneStyles[tone].icon,
          )}
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="truncate text-[11px] text-muted">{detail}</p>
        <ArrowUpRight
          className="size-3.5 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>
    </Link>
  )
}
