import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

function getPageNumbers(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const result: (number | 'ellipsis')[] = []
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1]
    if (previous && page - previous > 1) {
      result.push('ellipsis')
    }
    result.push(page)
  })
  return result
}

interface PaginationProps {
  count: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  itemLabel?: string
  className?: string
}

export function Pagination({
  count,
  page,
  pageSize,
  onPageChange,
  itemLabel = 'items',
  className,
}: PaginationProps) {
  if (count === 0) return null

  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, count)
  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav
      className={cn(
        'flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      aria-label="Pagination"
    >
      <p className="text-xs font-medium text-muted">
        Showing <span className="font-semibold text-ink">{start}</span>–
        <span className="font-semibold text-ink">{end}</span> of{' '}
        <span className="font-semibold text-ink">{count}</span> {itemLabel}
      </p>

      <div className="flex items-center justify-between gap-1 sm:justify-end">
        <Button
          variant="secondary"
          size="sm"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2.5"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <span className="px-2 text-xs font-semibold text-muted sm:hidden">
          Page {currentPage} of {totalPages}
        </span>

        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="grid size-8 place-items-center text-xs text-subtle"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={cn(
                  'grid size-8 place-items-center rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2',
                  item === currentPage
                    ? 'bg-brand-600 text-white'
                    : 'text-muted hover:bg-slate-100 hover:text-ink',
                )}
                aria-label={`Page ${item}`}
                aria-current={item === currentPage ? 'page' : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2.5"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
