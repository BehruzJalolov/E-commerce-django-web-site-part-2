import { clamp } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  color?: string
  className?: string
  size?: 'sm' | 'md'
  label: string
}

export function ProgressBar({
  value,
  color = '#4f46e5',
  className,
  size = 'md',
  label,
}: ProgressBarProps) {
  const safeValue = clamp(Math.round(value), 0, 100)
  return (
    <div
      className={
        size === 'sm'
          ? `h-1.5 w-full overflow-hidden rounded-full bg-slate-100 ${className ?? ''}`
          : `h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className ?? ''}`
      }
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300 ease-out"
        style={{ width: `${safeValue}%`, backgroundColor: color }}
      />
    </div>
  )
}
