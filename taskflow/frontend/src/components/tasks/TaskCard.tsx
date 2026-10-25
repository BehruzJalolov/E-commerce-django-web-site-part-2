import { GripVertical } from 'lucide-react'
import { Link } from 'react-router-dom'

import { TaskActionsMenu } from '@/components/tasks/TaskActionsMenu'
import {
  DueDateLabel,
  TaskPriorityBadge,
} from '@/components/tasks/TaskBadges'
import { TaskStatusMenu } from '@/components/tasks/TaskStatusMenu'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types/api'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onStatusChange: (task: Task, status: TaskStatus) => void
  onDragStart: (task: Task) => void
  onDragEnd: () => void
  upNext?: boolean
  updating?: boolean
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onDragStart,
  onDragEnd,
  upNext = false,
  updating = false,
}: TaskCardProps) {
  return (
    <article
      className={cn(
        'group relative rounded-xl border border-line bg-surface p-3.5 shadow-[0_1px_2px_rgb(16_24_40/0.03)] transition-[box-shadow,border-color,transform] duration-150 hover:-translate-y-px hover:border-line-strong hover:shadow-card',
        updating && 'opacity-70',
      )}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', String(task.id))
        onDragStart(task)
      }}
      onDragEnd={onDragEnd}
      aria-label={task.title}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-muted">
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: task.project_detail.color }}
            aria-hidden="true"
          />
          <span className="truncate">{task.project_detail.name}</span>
        </span>
        <div className="flex shrink-0 items-center">
          {upNext ? (
            <span className="mr-1 rounded bg-brand-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-700">
              Up next
            </span>
          ) : null}
          <GripVertical
            className="mr-0.5 size-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
          <TaskActionsMenu
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            triggerClassName="-mr-1 grid size-7 place-items-center rounded-md text-subtle opacity-60 transition hover:bg-slate-100 hover:text-ink hover:opacity-100 focus-visible:outline-2"
          />
        </div>
      </div>

      <h3 className="mt-2.5">
        <Link
          to={`/app/tasks/${task.id}`}
          className={cn(
            'line-clamp-2 text-[13px] font-semibold leading-5 transition-colors hover:text-brand-700',
            task.is_completed
              ? 'text-muted line-through decoration-slate-300'
              : 'text-ink',
          )}
        >
          {task.title}
        </Link>
      </h3>

      {task.description ? (
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-[1.6] text-muted">
          {task.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TaskPriorityBadge priority={task.priority} />
        <DueDateLabel task={task} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/80 pt-2.5">
        <TaskStatusMenu
          value={task.status}
          onChange={(status) => onStatusChange(task, status)}
          pending={updating}
          className="border-transparent bg-transparent px-0 hover:bg-transparent"
        />
      </div>
    </article>
  )
}
