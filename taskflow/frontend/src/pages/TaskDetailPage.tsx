import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FolderKanban,
  Pencil,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useState } from 'react'

import { TaskDeleteDialog } from '@/components/tasks/TaskDeleteDialog'
import {
  DueDateLabel,
  TaskPriorityBadge,
  TaskStatusBadge,
} from '@/components/tasks/TaskBadges'
import { StatusPicker } from '@/components/tasks/TaskStatusMenu'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTaskDialog } from '@/context/TaskDialogContext'
import { useUpdateTask } from '@/hooks/useMutations'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTask } from '@/hooks/useWorkspace'
import { formatDate, formatDateTime, getDueDateMeta } from '@/lib/dates'
import { getErrorMessage } from '@/lib/errors'
import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/types/api'

export function TaskDetailPage() {
  const { taskId } = useParams()
  const numericId = Number(taskId)
  const navigate = useNavigate()
  const { openEditTask } = useTaskDialog()
  const taskQuery = useTask(
    Number.isInteger(numericId) && numericId > 0 ? numericId : 0,
  )
  const updateMutation = useUpdateTask()
  const task = taskQuery.data
  useDocumentTitle(task?.title ?? 'Task details')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return (
      <div className="page-shell">
        <ErrorState
          title="Invalid task link"
          error={new Error('The task identifier in this link is not valid.')}
        />
        <div className="mt-4 text-center">
          <Button variant="secondary" asChild>
            <Link to="/app/tasks">Back to tasks</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (taskQuery.isPending) {
    return (
      <div className="page-shell">
        <Skeleton className="h-4 w-24" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Skeleton className="h-[420px] rounded-[18px]" />
          <div className="space-y-4">
            <Skeleton className="h-[180px] rounded-[18px]" />
            <Skeleton className="h-[150px] rounded-[18px]" />
          </div>
        </div>
      </div>
    )
  }

  if (taskQuery.isError || !task) {
    return (
      <div className="page-shell">
        <Link
          to="/app/tasks"
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to tasks
        </Link>
        <ErrorState
          error={
            taskQuery.error ??
            new Error('This task could not be found or is no longer available.')
          }
          title="Task not found"
          onRetry={() => {
            void taskQuery.refetch()
          }}
        />
      </div>
    )
  }

  const changeStatus = async (status: TaskStatus) => {
    try {
      await updateMutation.mutateAsync({
        taskId: task.id,
        payload: { status },
      })
      toast.success(
        status === 'done'
          ? 'Task completed'
          : status === 'todo'
            ? 'Task reopened'
            : 'Status updated',
        { description: task.title },
      )
    } catch (error) {
      toast.error('Could not update status', {
        description: getErrorMessage(error),
      })
    }
  }

  const due = getDueDateMeta(task.due_date, {
    completed: task.is_completed,
    isOverdue: task.is_overdue,
  })
  const pending = updateMutation.isPending

  return (
    <div className="page-shell max-w-[1180px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/app/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to tasks
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={task.is_completed ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => {
              void changeStatus(task.is_completed ? 'todo' : 'done')
            }}
            loading={pending}
          >
            {task.is_completed ? (
              <RotateCcw className="size-3.5" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
            )}
            {task.is_completed ? 'Reopen task' : 'Mark complete'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEditTask(task)}
            disabled={pending}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="danger-ghost"
            size="icon-sm"
            aria-label="Delete task"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={pending}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="card overflow-hidden">
          <div className="border-b border-line bg-slate-50/50 px-5 py-4 sm:px-7">
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              {task.is_overdue ? (
                <Badge tone="danger">Overdue</Badge>
              ) : null}
              {task.project_detail.is_archived ? (
                <Badge tone="neutral">Archived project</Badge>
              ) : null}
            </div>
            <h1
              className={cn(
                'mt-3 text-balance font-display text-[26px] font-extrabold leading-tight tracking-[-0.035em] sm:text-[32px]',
                task.is_completed
                  ? 'text-muted line-through decoration-slate-300 decoration-2'
                  : 'text-ink',
              )}
            >
              {task.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                to={`/app/projects/${task.project}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: task.project_detail.color }}
                  aria-hidden="true"
                />
                {task.project_detail.name}
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </Link>
              <DueDateLabel task={task} />
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7">
            <h2 className="eyebrow">Description</h2>
            {task.description ? (
              <div className="mt-3 whitespace-pre-wrap break-words text-[14px] leading-7 text-muted">
                {task.description}
              </div>
            ) : (
              <p className="mt-3 text-sm italic leading-6 text-subtle">
                No description has been added yet. Use the edit action to add
                context, a definition of done or links.
              </p>
            )}
          </div>

          <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line bg-slate-50/40 px-5 py-3.5 text-[11px] text-subtle sm:px-7">
            <span>Created {formatDateTime(task.created_at)}</span>
            <span>Updated {formatDateTime(task.updated_at)}</span>
          </footer>
        </article>

        <aside className="space-y-4">
          <section className="card p-5">
            <h2 className="text-sm font-bold text-ink">Move this task</h2>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              Update its status directly. Changes save immediately.
            </p>
            <div className="mt-4">
              <StatusPicker
                value={task.status}
                onChange={(status) => {
                  void changeStatus(status)
                }}
                pending={pending}
              />
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <FolderKanban className="size-4 text-muted" aria-hidden="true" />
              <h2 className="text-sm font-bold text-ink">Project</h2>
            </div>
            <Link
              to={`/app/projects/${task.project}`}
              className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas/60 p-3 transition-colors hover:border-line-strong"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: task.project_detail.color }}
                  aria-hidden="true"
                />
                <span className="truncate text-xs font-semibold text-ink">
                  {task.project_detail.name}
                </span>
              </span>
              <ArrowUpRight
                className="size-3.5 shrink-0 text-subtle"
                aria-hidden="true"
              />
            </Link>
            {task.project_detail.is_archived ? (
              <p className="mt-2 text-[10px] text-muted">
                This project is archived. Its tasks remain available.
              </p>
            ) : null}
          </section>

          <section className="card p-5">
            <h2 className="text-sm font-bold text-ink">Details</h2>
            <dl className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <CalendarDays
                  className="mt-0.5 size-4 shrink-0 text-subtle"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-[10px] font-medium text-subtle">
                    Due date
                  </dt>
                  <dd className="mt-0.5 font-semibold text-ink">
                    {task.due_date ? formatDate(task.due_date) : 'No due date'}
                  </dd>
                  {task.due_date ? (
                    <dd
                      className={cn(
                        'mt-0.5 text-[10px]',
                        due.tone === 'overdue' ? 'text-danger' : 'text-muted',
                      )}
                    >
                      {due.label}
                    </dd>
                  ) : null}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock3
                  className="mt-0.5 size-4 shrink-0 text-subtle"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-[10px] font-medium text-subtle">
                    Last updated
                  </dt>
                  <dd className="mt-0.5 font-semibold text-ink">
                    {formatDateTime(task.updated_at)}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {task.is_completed ? (
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-positive"
                    aria-hidden="true"
                  />
                ) : (
                  <CircleDashed
                    className="mt-0.5 size-4 shrink-0 text-subtle"
                    aria-hidden="true"
                  />
                )}
                <div>
                  <dt className="text-[10px] font-medium text-subtle">
                    Completion
                  </dt>
                  <dd className="mt-0.5 font-semibold text-ink">
                    {task.is_completed && task.completed_at
                      ? formatDateTime(task.completed_at)
                      : 'Not completed'}
                  </dd>
                </div>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      <TaskDeleteDialog
        task={deleteDialogOpen ? task : null}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleted={() => navigate('/app/tasks', { replace: true })}
      />
    </div>
  )
}
