import { Check, ChevronDown, LoaderCircle } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { TASK_STATUS_OPTIONS, STATUS_META } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/api'

interface TaskStatusMenuProps {
  value: TaskStatus
  onChange: (status: TaskStatus) => void
  pending?: boolean
  disabled?: boolean
  className?: string
}

export function TaskStatusMenu({
  value,
  onChange,
  pending = false,
  disabled = false,
  className,
}: TaskStatusMenuProps) {
  const current = STATUS_META[value]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled || pending}>
        <button
          type="button"
          className={cn(
            'inline-flex h-7 max-w-full items-center gap-1.5 rounded-md border border-line bg-white px-2 text-[11px] font-semibold text-muted transition-colors hover:border-line-strong hover:bg-slate-50 hover:text-ink focus-visible:outline-2 disabled:cursor-wait disabled:opacity-60',
            className,
          )}
          aria-label={`Change status. Current status: ${current.label}`}
          aria-busy={pending || undefined}
        >
          {pending ? (
            <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
          ) : (
            <span
              className={cn('size-1.5 rounded-full', current.dot)}
              aria-hidden="true"
            />
          )}
          <span className="truncate">{current.label}</span>
          <ChevronDown className="size-3 shrink-0" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[210px]">
        <DropdownMenuLabel>Move task to</DropdownMenuLabel>
        {TASK_STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => {
              if (option.value !== value) onChange(option.value)
            }}
            icon={option.value === value ? Check : undefined}
          >
            <span
              className={cn(
                'size-2 shrink-0 rounded-full',
                STATUS_META[option.value].dot,
              )}
              aria-hidden="true"
            />
            <span className="flex-1">{option.label}</span>
            {option.value === value ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-subtle">
                Current
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface StatusPickerProps {
  value: TaskStatus
  onChange: (status: TaskStatus) => void
  pending?: boolean
}

export function StatusPicker({ value, onChange, pending }: StatusPickerProps) {
  return (
    <div className="grid gap-2" role="group" aria-label="Task status">
      {TASK_STATUS_OPTIONS.map((option) => {
        const meta = STATUS_META[option.value]
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              if (!active) onChange(option.value)
            }}
            disabled={pending}
            aria-pressed={active}
            className={cn(
              'flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all disabled:cursor-wait',
              active
                ? 'border-brand-300 bg-brand-50/70 ring-2 ring-brand-500/10'
                : 'border-line bg-white hover:border-line-strong hover:bg-slate-50',
            )}
          >
            <span
              className={cn(
                'mt-1 size-2.5 shrink-0 rounded-full',
                meta.dot,
              )}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span
                className={cn(
                  'block text-xs font-bold',
                  active ? 'text-brand-800' : 'text-ink',
                )}
              >
                {option.label}
              </span>
              <span className="mt-0.5 block text-[11px] leading-4 text-muted">
                {option.description}
              </span>
            </span>
            {active && pending ? (
              <LoaderCircle
                className="ml-auto mt-0.5 size-3.5 animate-spin text-brand-600"
                aria-label="Updating status"
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
