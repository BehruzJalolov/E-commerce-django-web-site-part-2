import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query'
import { Columns3, LoaderCircle, Plus, SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskDeleteDialog } from '@/components/tasks/TaskDeleteDialog'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/PageHeader'
import { SearchInput } from '@/components/ui/SearchInput'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTaskDialog } from '@/context/TaskDialogContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAllProjects, useInfiniteTasks } from '@/hooks/useWorkspace'
import { api } from '@/lib/api'
import {
  PRIORITY_META,
  STATUS_META,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from '@/lib/constants'
import { getErrorMessage } from '@/lib/errors'
import { cn, pluralize } from '@/lib/utils'
import type {
  PaginatedResponse,
  Task,
  TaskPriority,
  TaskStatus,
} from '@/types/api'

type BoardData = InfiniteData<PaginatedResponse<Task>, number>

interface MoveVariables {
  task: Task
  status: TaskStatus
}

function BoardSkeleton() {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-3" aria-label="Loading board">
      {Array.from({ length: 3 }).map((_, column) => (
        <div key={column} className="rounded-2xl border border-line bg-slate-50/60 p-3">
          <Skeleton className="h-5 w-28" />
          <div className="mt-4 space-y-2.5">
            {Array.from({ length: 3 - column }).map((_, card) => (
              <Skeleton key={card} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function BoardPage() {
  useDocumentTitle('Board')
  const [searchParams, setSearchParams] = useSearchParams()
  const { openCreateTask, openEditTask } = useTaskDialog()
  const projectsQuery = useAllProjects()
  const queryClient = useQueryClient()
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)

  const urlSearch = searchParams.get('search') ?? ''
  const [searchText, setSearchText] = useState(urlSearch)

  const rawProject = Number(searchParams.get('project'))
  const project =
    Number.isInteger(rawProject) && rawProject > 0 ? rawProject : undefined
  const rawPriority = searchParams.get('priority')
  const priority = TASK_PRIORITY_OPTIONS.some(
    (option) => option.value === rawPriority,
  )
    ? (rawPriority as TaskPriority)
    : undefined

  useEffect(() => {
    setSearchText(urlSearch)
  }, [urlSearch])

  useEffect(() => {
    if (searchText === urlSearch) return
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      if (searchText.trim()) {
        next.set('search', searchText.trim())
      } else {
        next.delete('search')
      }
      setSearchParams(next, { replace: true })
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [searchParams, searchText, setSearchParams, urlSearch])

  const boardQuery = useInfiniteTasks({
    search: urlSearch,
    project,
    priority,
    ordering: 'priority',
    page_size: 100,
  })

  const tasks = useMemo(() => {
    const seen = new Set<number>()
    return (boardQuery.data?.pages ?? []).flatMap((page) =>
      page.results.filter((task) => {
        if (seen.has(task.id)) return false
        seen.add(task.id)
        return true
      }),
    )
  }, [boardQuery.data])

  const total = boardQuery.data?.pages[0]?.count ?? 0
  const hasFilters = Boolean(urlSearch || project || priority)

  const updateParam = (key: 'project' | 'priority', value?: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => {
    setSearchText('')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const moveMutation = useMutation({
    mutationFn: ({ task, status }: MoveVariables) =>
      api.updateTask(task.id, { status }),
    onMutate: async ({ task, status }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', 'infinite'] })
      const previous = queryClient.getQueriesData<BoardData>({
        queryKey: ['tasks', 'infinite'],
      })

      queryClient.setQueriesData<BoardData>(
        { queryKey: ['tasks', 'infinite'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((item) => {
                if (item.id !== task.id) return item
                return {
                  ...item,
                  status,
                  status_display: STATUS_META[status].label,
                  is_completed: status === 'done',
                  is_overdue: status === 'done' ? false : item.is_overdue,
                  completed_at:
                    status === 'done'
                      ? (item.completed_at ?? new Date().toISOString())
                      : null,
                }
              }),
            })),
          }
        },
      )

      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data)
        }
      }
      toast.error('Could not move task', {
        description: getErrorMessage(error),
      })
    },
    onSuccess: (_data, variables) => {
      toast.success(
        variables.status === 'done'
          ? 'Task completed'
          : `Moved to ${STATUS_META[variables.status].label}`,
        { description: variables.task.title },
      )
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const moveTask = (task: Task, status: TaskStatus) => {
    if (status === task.status || moveMutation.isPending) return
    moveMutation.mutate({ task, status })
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Flow"
        title="Board"
        description="See work move from idea to done. Drag cards on desktop, or use each card’s accessible status menu."
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link to="/app/tasks">List view</Link>
            </Button>
            <Button onClick={() => openCreateTask(project)}>
              <Plus className="size-4" aria-hidden="true" />
              New task
            </Button>
          </>
        }
      />

      <section
        className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-3 shadow-card"
        aria-label="Board filters"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={searchText}
            onChange={setSearchText}
            placeholder="Search cards…"
            label="Search board"
            className="min-w-0 flex-1"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="board-project" className="sr-only">
              Filter board by project
            </label>
            <Select
              id="board-project"
              value={project ?? ''}
              onChange={(event) =>
                updateParam('project', event.target.value || undefined)
              }
              disabled={projectsQuery.isPending}
              className="h-10 min-w-0 sm:w-[180px]"
              aria-label="Filter board by project"
            >
              <option value="">All projects</option>
              {(projectsQuery.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.is_archived ? ' (archived)' : ''}
                </option>
              ))}
            </Select>
            <label htmlFor="board-priority" className="sr-only">
              Filter board by priority
            </label>
            <Select
              id="board-priority"
              value={priority ?? ''}
              onChange={(event) =>
                updateParam('priority', event.target.value || undefined)
              }
              className="h-10 min-w-0 sm:w-[150px]"
              aria-label="Filter board by priority"
            >
              <option value="">All priorities</option>
              {TASK_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {PRIORITY_META[option.value].label}
                </option>
              ))}
            </Select>
            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0"
              >
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted" aria-live="polite">
          {boardQuery.isPending
            ? 'Loading board…'
            : `${pluralize(total, 'task')}${
                hasFilters ? ' match your filters' : ' on your board'
              }${
                boardQuery.hasNextPage
                  ? ` · showing ${tasks.length} loaded`
                  : ''
              }`}
        </p>
        <div className="flex items-center gap-2">
          {boardQuery.isFetching && !boardQuery.isPending ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-subtle">
              <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
              Updating
            </span>
          ) : null}
          {boardQuery.hasNextPage ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void boardQuery.fetchNextPage()
              }}
              loading={boardQuery.isFetchingNextPage}
            >
              Load more tasks
            </Button>
          ) : null}
        </div>
      </div>

      {boardQuery.isPending ? (
        <BoardSkeleton />
      ) : boardQuery.isError ? (
        <ErrorState
          className="mt-3"
          error={boardQuery.error}
          title="Board could not be loaded"
          onRetry={() => {
            void boardQuery.refetch()
          }}
        />
      ) : tasks.length === 0 ? (
        <div className="mt-3">
          {hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="No cards match these filters"
              description="Remove a filter or broaden your search to bring more tasks back onto the board."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Columns3}
              title="Your board is ready"
              description="Create a task and it will appear in To Do. Then drag it forward or use the status menu."
              action={
                <Button onClick={() => openCreateTask()}>
                  <Plus className="size-4" aria-hidden="true" />
                  Create your first task
                </Button>
              }
              secondaryAction={
                <Button variant="secondary" asChild>
                  <Link to="/app/projects">Browse projects</Link>
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="mt-3 grid items-start gap-4 md:grid-cols-3">
          {TASK_STATUS_OPTIONS.map((column) => {
            const columnTasks = tasks.filter(
              (task) => task.status === column.value,
            )
            const isOver = dragOverColumn === column.value

            return (
              <section
                key={column.value}
                className={cn(
                  'rounded-2xl border border-line bg-slate-50/70 p-2.5 transition-colors',
                  isOver && 'border-brand-300 bg-brand-50/50',
                )}
                aria-label={`${column.label} column, ${columnTasks.length} tasks`}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                  if (dragOverColumn !== column.value) {
                    setDragOverColumn(column.value)
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragOverColumn(null)
                  if (draggedTask) {
                    moveTask(draggedTask, column.value)
                  }
                  setDraggedTask(null)
                }}
              >
                <header className="flex items-center justify-between gap-2 px-1.5 pb-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        STATUS_META[column.value].dot,
                      )}
                      aria-hidden="true"
                    />
                    <h2 className="text-xs font-bold text-ink">{column.label}</h2>
                    <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-muted ring-1 ring-line">
                      {columnTasks.length}
                    </span>
                  </div>
                  {column.value === 'todo' ? (
                    <span className="text-[9px] font-medium text-subtle">
                      Drop to plan
                    </span>
                  ) : null}
                </header>

                <div className="min-h-[120px] space-y-2.5 rounded-xl">
                  {columnTasks.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEditTask}
                      onDelete={setTaskToDelete}
                      onStatusChange={(item, status) =>
                        moveTask(item, status)
                      }
                      onDragStart={setDraggedTask}
                      onDragEnd={() => {
                        setDraggedTask(null)
                        setDragOverColumn(null)
                      }}
                      upNext={column.value === 'todo' && index === 0}
                      updating={
                        moveMutation.isPending &&
                        moveMutation.variables?.task.id === task.id
                      }
                    />
                  ))}
                  {columnTasks.length === 0 ? (
                    <div
                      className={cn(
                        'grid min-h-[100px] place-items-center rounded-xl border border-dashed border-line-strong px-3 text-center',
                        isOver && 'border-brand-300 bg-white/60',
                      )}
                    >
                      <p className="text-[11px] leading-5 text-subtle">
                        {isOver
                          ? 'Release to move this task here.'
                          : 'No tasks here yet.'}
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-[10px] text-subtle">
        <Columns3 className="size-3" aria-hidden="true" />
        Status changes persist immediately. If a request fails, cards return to
        their previous column.
      </p>

      <TaskDeleteDialog
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
      />
    </div>
  )
}
