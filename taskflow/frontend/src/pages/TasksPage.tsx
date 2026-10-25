import { ListChecks, LoaderCircle, Plus, SearchX } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { TaskDeleteDialog } from '@/components/tasks/TaskDeleteDialog'
import {
  TaskFilters,
  type TaskFilterValues,
} from '@/components/tasks/TaskFilters'
import { TaskTable } from '@/components/tasks/TaskTable'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTaskDialog } from '@/context/TaskDialogContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAllProjects, useTasks } from '@/hooks/useWorkspace'
import {
  DUE_FILTER_OPTIONS,
  PAGE_SIZE,
  SORT_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from '@/lib/constants'
import { getPageParam, pluralize } from '@/lib/utils'
import type {
  SortOrder,
  Task,
  TaskPriority,
  TaskQuery,
  TaskStatus,
} from '@/types/api'

function parseFilters(searchParams: URLSearchParams): TaskFilterValues {
  const rawStatus = searchParams.get('status')
  const status = TASK_STATUS_OPTIONS.some(
    (option) => option.value === rawStatus,
  )
    ? (rawStatus as TaskStatus)
    : undefined

  const rawPriority = searchParams.get('priority')
  const priority = TASK_PRIORITY_OPTIONS.some(
    (option) => option.value === rawPriority,
  )
    ? (rawPriority as TaskPriority)
    : undefined

  const rawDue = searchParams.get('due')
  const due = DUE_FILTER_OPTIONS.some((option) => option.value === rawDue)
    ? (rawDue as 'overdue' | 'today' | 'upcoming' | 'none')
    : undefined

  const rawProject = Number(searchParams.get('project'))
  const project =
    Number.isInteger(rawProject) && rawProject > 0 ? rawProject : undefined

  const rawOrdering = searchParams.get('ordering')
  const ordering = SORT_OPTIONS.some(
    (option) => option.value === rawOrdering,
  )
    ? (rawOrdering as SortOrder)
    : '-updated_at'

  return {
    search: searchParams.get('search')?.trim() ?? '',
    status,
    priority,
    project,
    due,
    ordering,
  }
}

function TasksSkeleton() {
  return (
    <div className="mt-5 space-y-2 rounded-[var(--radius-card)] border border-line bg-surface p-4" aria-label="Loading tasks">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 py-3">
          <Skeleton className="size-5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="hidden h-5 w-16 rounded-full sm:block" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export function TasksPage() {
  useDocumentTitle('Tasks')
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  const page = getPageParam(searchParams)
  const { openCreateTask, openEditTask } = useTaskDialog()
  const allProjectsQuery = useAllProjects()
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)

  const queryParams: TaskQuery = {
    ...filters,
    page,
    page_size: PAGE_SIZE,
  }
  const tasksQuery = useTasks(queryParams)

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.priority ||
      filters.project ||
      filters.due,
  )

  const updateFilters = useCallback(
    (patch: Partial<TaskFilterValues>) => {
      const next = new URLSearchParams(searchParams)
      next.delete('page')

      for (const key of [
        'search',
        'status',
        'priority',
        'project',
        'due',
        'ordering',
      ] as const) {
        if (!(key in patch)) continue
        const value = patch[key]
        if (value === undefined || value === '') {
          next.delete(key)
        } else if (key === 'ordering' && value === '-updated_at') {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      }

      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(nextPage))
    }
    setSearchParams(next, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleTaskDeleted = () => {
    if (page > 1 && tasksQuery.data?.results.length === 1) {
      setPage(page - 1)
    }
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Your work"
        title="Tasks"
        description="Every task across your projects, with the context you need to choose what matters next."
        actions={
          <>
            <Button variant="secondary" asChild>
              <Link to="/app/board">Open board</Link>
            </Button>
            <Button onClick={() => openCreateTask()}>
              <Plus className="size-4" aria-hidden="true" />
              New task
            </Button>
          </>
        }
      />

      <div className="mt-6">
        <TaskFilters
          value={filters}
          onChange={updateFilters}
          onClear={clearFilters}
          projects={allProjectsQuery.data ?? []}
          projectsLoading={allProjectsQuery.isPending}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted" aria-live="polite">
          {tasksQuery.isPending
            ? 'Loading tasks…'
            : tasksQuery.data
              ? `${pluralize(tasksQuery.data.count, 'task')}${
                  hasActiveFilters ? ' match your filters' : ' in your workspace'
                }`
              : null}
        </p>
        {tasksQuery.isFetching && !tasksQuery.isPending ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-subtle">
            <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
            Updating
          </span>
        ) : null}
      </div>

      {tasksQuery.isPending ? (
        <TasksSkeleton />
      ) : tasksQuery.isError ? (
        <ErrorState
          className="mt-3"
          error={tasksQuery.error}
          title="Tasks could not be loaded"
          onRetry={() => {
            void tasksQuery.refetch()
          }}
        />
      ) : tasksQuery.data && tasksQuery.data.count === 0 ? (
        <div className="mt-3">
          {hasActiveFilters ? (
            <EmptyState
              icon={SearchX}
              title="No tasks match these filters"
              description="Try a broader search or remove one of the active filters to see more of your work."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear all filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ListChecks}
              title="No tasks yet"
              description="Create your first task and give your week a clear next step. Tasks live inside projects, so you can always find them again."
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
      ) : tasksQuery.data ? (
        <>
          <div className="mt-3">
            <TaskTable
              tasks={tasksQuery.data.results}
              onEdit={openEditTask}
              onDelete={setTaskToDelete}
            />
          </div>
          <Pagination
            className="mt-5"
            count={tasksQuery.data.count}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="tasks"
          />
        </>
      ) : null}

      <TaskDeleteDialog
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onDeleted={handleTaskDeleted}
      />
    </div>
  )
}
