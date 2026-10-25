import { PRIORITY_META } from '@/lib/constants'
import type { PriorityItem } from '@/types/api'

export function PriorityBars({ items }: { items: PriorityItem[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const nonEmpty = items.filter((item) => item.count > 0)

  if (total === 0) {
    return (
      <p className="py-8 text-center text-xs text-muted">
        No priority data yet.
      </p>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => {
        const meta = PRIORITY_META[item.key]
        const percentage = Math.round((item.count / total) * 100)
        return (
          <div key={item.key}>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[11px] font-medium text-muted">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: meta.hex }}
                  aria-hidden="true"
                />
                {item.label}
              </span>
              <span className="text-[11px] font-bold tabular-nums text-ink">
                {item.count}
                <span className="ml-1.5 font-medium text-subtle">
                  · {percentage}%
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: meta.hex,
                }}
              />
            </div>
          </div>
        )
      })}
      {nonEmpty.length === 0 ? (
        <p className="text-center text-xs text-muted">No priority data yet.</p>
      ) : null}
    </div>
  )
}
