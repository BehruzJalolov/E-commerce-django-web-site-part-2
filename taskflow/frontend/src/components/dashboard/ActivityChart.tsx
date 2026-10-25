import { formatShortDate } from '@/lib/dates'
import type { WeeklyActivityItem } from '@/types/api'

interface ActivityChartProps {
  items: WeeklyActivityItem[]
}

export function ActivityChart({ items }: ActivityChartProps) {
  const max = Math.max(
    1,
    ...items.flatMap((item) => [item.created, item.completed]),
  )
  const createdTotal = items.reduce((sum, item) => sum + item.created, 0)
  const completedTotal = items.reduce((sum, item) => sum + item.completed, 0)
  const summary = items
    .map(
      (item) =>
        `${formatShortDate(item.date)}: ${item.created} created, ${item.completed} completed`,
    )
    .join('. ')

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-[10px] font-medium text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-brand-400" aria-hidden="true" />
            Created
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-emerald-400" aria-hidden="true" />
            Completed
          </span>
        </div>
        <p className="text-[10px] font-medium text-subtle">
          {createdTotal} created · {completedTotal} completed
        </p>
      </div>

      <div
        className="relative mt-4 h-[146px]"
        role="img"
        aria-label={`Weekly activity. ${summary}`}
      >
        <div
          className="absolute inset-0 flex flex-col justify-between"
          aria-hidden="true"
        >
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="border-t border-dashed border-line/80" />
          ))}
        </div>

        <div className="relative flex h-full items-end gap-1.5 sm:gap-2">
          {items.map((item) => (
            <div
              key={item.date}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              title={`${formatShortDate(item.date)} — ${item.created} created, ${item.completed} completed`}
            >
              <div className="flex h-[122px] w-full items-end justify-center gap-[3px]">
                <span
                  className="w-[38%] max-w-3.5 rounded-t-[3px] bg-brand-400 transition-[height] duration-300"
                  style={{
                    height: `${
                      item.created === 0
                        ? 2
                        : Math.max(6, (item.created / max) * 100)
                    }%`,
                  }}
                  aria-hidden="true"
                />
                <span
                  className="w-[38%] max-w-3.5 rounded-t-[3px] bg-emerald-400 transition-[height] duration-300"
                  style={{
                    height: `${
                      item.completed === 0
                        ? 2
                        : Math.max(6, (item.completed / max) * 100)
                    }%`,
                  }}
                  aria-hidden="true"
                />
              </div>
              <span className="mt-2 text-[9px] font-semibold text-subtle">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
