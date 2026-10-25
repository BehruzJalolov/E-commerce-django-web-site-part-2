import { CheckCircle2, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { TaskActionsMenu } from '@/components/tasks/TaskActionsMenu'
import {
  DueDateLabel,
  TaskPriorityBadge,
} from '@/components/tasks/TaskBadges'
import { TaskStatusMenu } from '@/components/tasks/TaskStatusMenu'
import { useUpdateTask } from '@/hooks/useMutations'
import { getErrorMessage } from '@/lib/errors'
import { formatRelativeTime } from '@/lib/dates'
import type { Task, TaskStatus } from '@/types/api'

interface TaskTableProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

function ProjectMarker({ task }: { task: Task }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted">
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: task.project_detail.color }}
        aria-hidden="true"
      />
      <span className="truncate hover:text-ink">
        {task.project_detail.name}
      </span>
      {task.project_detail.is_archived ? (
        <span className="shrink-0 rounded bg-slate-100 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-subtle">
          Archived
        </span>
      ) : null}
    </span>
  )
}

export function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
  const updateMutation = useUpdateTask()
  const pendingId = updateMutation.isPending
    ? updateMutation.variables?.taskId
    : undefined

  const changeStatus = async (task: Task, status: TaskStatus) => {
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
      toast.error('Could not update task', {
        description: getErrorMessage(error),
      })
    }
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <caption className="sr-only">
              Your tasks with status, priority and due date
            </caption>
            <thead>
              <tr className="border-b border-line bg-slate-50/70">
                <th scope="col" className="w-12 px-4 py-3">
                  <span className="sr-only">Complete</span>
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted"
                >
                  Task
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted"
                >
                  Priority
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted"
                >
                  Due
                </th>
                <th
                  scope="col"
                  className="hidden px-3 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted xl:table-cell"
                >
                  Updated
                </th>
                <th scope="col" className="w-12 px-3 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const busy = pendingId === task.id
                return (
                  <tr
                    key={task.id}
                    className="group border-b border-line/80 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3.5 align-middle">
                      <button
                        type="button"
                        className="grid size-6 place-items-center rounded-full text-subtle transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-wait"
                        onClick={() => {
                          void changeStatus(
                            task,
                            task.is_completed ? 'todo' : 'done',
                          )
                        }}
                        disabled={busy}
                        aria-label={
                          task.is_completed
                            ? `Reopen ${task.title}`
                            : `Mark ${task.title} as complete`
                        }
                        aria-pressed={task.is_completed}
                      >
                        {busy ? (
                          <span
                            className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
                            aria-hidden="true"
                          />
                        ) : task.is_completed ? (
                          <CheckCircle2
                            className="size-5 text-emerald-500"
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle
                            className="size-5 text-slate-300 group-hover:text-emerald-500"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </td>
                    <td className="max-w-[340px] px-2 py-3.5 align-middle">
                      <Link
                        to={`/app/tasks/${task.id}`}
                        className={
                          task.is_completed
                            ? 'line-clamp-1 text-sm font-semibold text-muted line-through decoration-slate-300 hover:text-ink'
                            : 'line-clamp-1 text-sm font-semibold text-ink hover:text-brand-700'
                        }
                      >
                        {task.title}
                      </Link>
                      <div className="mt-1">
                        <ProjectMarker task={task} />
                      </div>
                    </td>
                    <td className="px-3 py-3.5 align-middle">
                      <TaskStatusMenu
                        value={task.status}
                        onChange={(status) => {
                          void changeStatus(task, status)
                        }}
                        pending={busy}
                      />
                    </td>
                    <td className="px-3 py-3.5 align-middle">
                      <TaskPriorityBadge priority={task.priority} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 align-middle">
                      <DueDateLabel task={task} />
                    </td>
                    <td className="hidden whitespace-nowrap px-3 py-3.5 align-middle text-xs text-subtle xl:table-cell">
                      {formatRelativeTime(task.updated_at)}
                    </td>
                    <td className="px-3 py-3.5 align-middle">
                      <TaskActionsMenu
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2.5 md:hidden">
        {tasks.map((task) => {
          const busy = pendingId === task.id
          return (
            <article
              key={task.id}
              className="rounded-xl border border-line bg-surface p-3.5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full"
                  onClick={() => {
                    void changeStatus(
                      task,
                      task.is_completed ? 'todo' : 'done',
                    )
                  }}
                  disabled={busy}
                  aria-label={
                    task.is_completed
                      ? `Reopen ${task.title}`
                      : `Mark ${task.title} as complete`
                  }
                  aria-pressed={task.is_completed}
                >
                  {busy ? (
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
                      aria-hidden="true"
                    />
                  ) : task.is_completed ? (
                    <CheckCircle2
                      className="size-5 text-emerald-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="size-5 text-slate-300"
                      aria-hidden="true"
                    />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/app/tasks/${task.id}`}
                    className={
                      task.is_completed
                        ? 'line-clamp-2 text-sm font-semibold text-muted line-through'
                        : 'line-clamp-2 text-sm font-semibold text-ink'
                    }
                  >
                    {task.title}
                  </Link>
                  <div className="mt-1.5">
                    <ProjectMarker task={task} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <TaskStatusMenu
                      value={task.status}
                      onChange={(status) => {
                        void changeStatus(task, status)
                      }}
                      pending={busy}
                    />
                    <TaskPriorityBadge priority={task.priority} />
                    <DueDateLabel task={task} />
                  </div>
                </div>
                <TaskActionsMenu
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  triggerClassName="-mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-subtle hover:bg-slate-100 hover:text-ink"
                />
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
