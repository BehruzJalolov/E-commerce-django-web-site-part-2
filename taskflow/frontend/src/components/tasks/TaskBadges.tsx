import { CalendarDays } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import {
  PRIORITY_META,
  STATUS_META,
} from '@/lib/constants'
import { formatDate, getDueDateMeta } from '@/lib/dates'
import { cn } from '@/lib/utils'
import type { Task, TaskPriority, TaskStatus } from '@/types/api'

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status]
  return (
    <Badge className={meta.badge} dot={meta.dot}>
      {meta.label}
    </Badge>
  )
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const meta = PRIORITY_META[priority]
  return <Badge className={meta.badge}>{meta.label}</Badge>
}

const dueToneStyles = {
  neutral: 'text-muted',
  upcoming: 'text-info',
  today: 'text-warning',
  overdue: 'text-danger font-semibold',
  complete: 'text-subtle',
}

interface DueDateLabelProps {
  task: Pick<Task, 'due_date' | 'is_completed' | 'is_overdue'>
  className?: string
  showIcon?: boolean
}

export function DueDateLabel({
  task,
  className,
  showIcon = true,
}: DueDateLabelProps) {
  const due = getDueDateMeta(task.due_date, {
    completed: task.is_completed,
    isOverdue: task.is_overdue,
  })

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs',
        dueToneStyles[due.tone],
        className,
      )}
      title={task.due_date ? `Due ${formatDate(task.due_date)}` : undefined}
    >
      {showIcon ? (
        <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
      ) : null}
      {due.label}
    </span>
  )
}
