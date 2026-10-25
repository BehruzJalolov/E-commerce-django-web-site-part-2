import type { StatusItem } from '@/types/api'

const COLORS: Record<string, string> = {
  todo: '#94a3b8',
  in_progress: '#0ea5e9',
  done: '#10b981',
}

interface StatusDonutProps {
  items: StatusItem[]
  total: number
  completion: number
}

export function StatusDonut({ items, total, completion }: StatusDonutProps) {
  const radius = 46
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
      <div
        className="relative size-[132px] shrink-0"
        role="img"
        aria-label={`${completion}% of all tasks are complete.`}
      >
        <svg viewBox="0 0 112 112" className="size-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke="#eef1f6"
            strokeWidth="10"
          />
          {total > 0
            ? items.map((item) => {
                if (item.count === 0) return null
                const segment = (item.count / total) * circumference
                const dash = Math.max(segment - 3, 0)
                const circle = (
                  <circle
                    key={item.key}
                    cx="56"
                    cy="56"
                    r={radius}
                    fill="none"
                    stroke={COLORS[item.key] ?? '#94a3b8'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                  />
                )
                offset += segment
                return circle
              })
            : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-display text-[26px] font-extrabold leading-none tracking-[-0.04em] text-ink">
            {completion}%
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">
            Complete
          </span>
        </div>
      </div>

      <div className="w-full space-y-2.5">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-medium text-muted">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: COLORS[item.key] }}
                aria-hidden="true"
              />
              {item.label}
            </span>
            <span className="text-xs font-bold tabular-nums text-ink">
              {item.count}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 border-t border-line pt-2.5">
          <span className="text-xs font-semibold text-ink">Total</span>
          <span className="text-xs font-bold tabular-nums text-ink">
            {total}
          </span>
        </div>
      </div>
    </div>
  )
}
