import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  FolderKanban,
  ListChecks,
  Pencil,
  Plus,
  SearchX,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { toast } from 'sonner'

import { ProjectDeleteDialog } from '@/components/projects/ProjectDeleteDialog'
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog'
import { TaskDeleteDialog } from '@/components/tasks/TaskDeleteDialog'
import { TaskTable } from '@/components/tasks/TaskTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Select } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SearchInput } from '@/components/ui/SearchInput'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTaskDialog } from '@/context/TaskDialogContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUpdateProject } from '@/hooks/useMutations'
import { useProject, useTasks } from '@/hooks/useWorkspace'
import {
  PAGE_SIZE,
  SORT_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from '@/lib/constants'
import { formatDate, formatRelativeTime } from '@/lib/dates'
import { getErrorMessage } from '@/lib/errors'
import { getPageParam, pluralize } from '@/lib/utils'
import type {
  SortOrder,
  Task,
  TaskPriority,
  TaskQuery,
  TaskStatus,
} from '@/types/api'

function ProjectDetailSkeleton() {
  return (
    <div className="page-shell" aria-label="Loading project">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-6 h-[214px] rounded-[18px]" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[108px] rounded-[18px]" />
        ))}
      </div>
      <Skeleton className="mt-5 h-[360px] rounded-[18px]" />
    </div>
  )
}

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const numericId = Number(projectId)
  const navigate = useNavigate()
  const { openCreateTask, openEditTask } = useTaskDialog()

  const projectQuery = useProject(
    Number.isInteger(numericId) && numericId > 0 ? numericId : 0,
  )
  const project = projectQuery.data
  useDocumentTitle(project?.name ?? 'Project details')

  const [searchParams, setSearchParams] = useSearchParams()
  const page = getPageParam(searchParams)
  const urlSearch = searchParams.get('search') ?? ''
  const [searchText, setSearchText] = useState(urlSearch)

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
  const rawOrdering = searchParams.get('ordering')
  const ordering = SORT_OPTIONS.some((option) => option.value === rawOrdering)
    ? (rawOrdering as SortOrder)
    : '-updated_at'

  const taskQueryParams: TaskQuery = {
    project: Number.isInteger(numericId) && numericId > 0 ? numericId : undefined,
    search: urlSearch,
    status,
    priority,
    ordering,
    page,
    page_size: PAGE_SIZE,
  }
  const tasksQuery = useTasks(taskQueryParams, projectQuery.isSuccess)

  const [formOpen, setFormOpen] = useState(false)
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const updateProject = useUpdateProject()

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
      next.delete('page')
      setSearchParams(next, { replace: true })
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [searchParams, searchText, setSearchParams, urlSearch])

  const updateParam = useCallback(
    (key: 'status' | 'priority' | 'ordering', value?: string) => {
      const next = new URLSearchParams(searchParams)
      if (!value || (key === 'ordering' && value === '-updated_at')) {
        next.delete(key)
      } else {
        next.set(key, value)
      }
      next.delete('page')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const hasFilters = Boolean(
    urlSearch || status || priority || ordering !== '-updated_at',
  )

  const clearFilters = useCallback(() => {
    setSearchText('')
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

  const handleArchive = async () => {
    if (!project) return
    const nextArchived = !project.is_archived
    try {
      await updateProject.mutateAsync({
        projectId: project.id,
        payload: { is_archived: nextArchived },
      })
      toast.success(nextArchived ? 'Project archived' : 'Project restored', {
        description: project.name,
      })
      setArchiveConfirmOpen(false)
    } catch (error) {
      toast.error('Could not update project', {
        description: getErrorMessage(error),
      })
    }
  }

  const handleProjectDeleted = () => {
    navigate('/app/projects', { replace: true })
  }

  const handleTaskDeleted = () => {
    if (page > 1 && tasksQuery.data?.results.length === 1) {
      setPage(page - 1)
    }
  }

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return (
      <div className="page-shell">
        <ErrorState
          title="Invalid project link"
          error={new Error('The project identifier in this link is not valid.')}
        />
        <div className="mt-4 text-center">
          <Button variant="secondary" asChild>
            <Link to="/app/projects">Back to projects</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (projectQuery.isPending) {
    return <ProjectDetailSkeleton />
  }

  if (projectQuery.isError || !project) {
    return (
      <div className="page-shell">
        <Link
          to="/app/projects"
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to projects
        </Link>
        <ErrorState
          error={
            projectQuery.error ??
            new Error('This project could not be found or is no longer available.')
          }
          title="Project not found"
          onRetry={() => {
            void projectQuery.refetch()
          }}
        />
      </div>
    )
  }

  const statItems = [
    {
      label: 'Total tasks',
      value: project.task_count,
      icon: ListChecks,
      tone: 'bg-brand-50 text-brand-600 ring-brand-100',
    },
    {
      label: 'Completed',
      value: project.completed_task_count,
      icon: CheckCircle2,
      tone: 'bg-positive-soft text-positive ring-emerald-100',
    },
    {
      label: 'Open',
      value: project.open_task_count,
      icon: CircleDashed,
      tone: 'bg-info-soft text-info ring-sky-100',
    },
    {
      label: 'Completion',
      value: `${project.completion_percentage}%`,
      icon: FolderKanban,
      tone: 'bg-slate-100 text-slate-600 ring-slate-200',
    },
  ]

  return (
    <div className="page-shell">
      <Link
        to="/app/projects"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to projects
      </Link>

      <section className="relative mt-4 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-card">
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: project.color }}
          aria-hidden="true"
        />
        <div className="p-5 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="grid size-11 place-items-center rounded-xl"
                  style={{
                    color: project.color,
                    backgroundColor: `${project.color}14`,
                  }}
                  aria-hidden="true"
                >
                  <FolderKanban className="size-5" />
                </span>
                {project.is_archived ? (
                  <Badge tone="neutral">
                    <Archive className="size-3" aria-hidden="true" />
                    Archived
                  </Badge>
                ) : (
                  <Badge tone="success">Active project</Badge>
                )}
              </div>

              <h1 className="mt-4 text-balance font-display text-[28px] font-extrabold leading-tight tracking-[-0.04em] text-ink sm:text-[34px]">
                {project.name}
              </h1>
              <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-muted">
                {project.description || 'No description has been added yet.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-subtle">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Created {formatDate(project.created_at)}
                </span>
                <span>
                  Updated {formatRelativeTime(project.updated_at)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
              <Button
                onClick={() => openCreateTask(project.id)}
                disabled={project.is_archived}
              >
                <Plus className="size-4" aria-hidden="true" />
                New task
              </Button>
              <Button
                variant="secondary"
                onClick={() => setFormOpen(true)}
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => setArchiveConfirmOpen(true)}
                loading={updateProject.isPending}
              >
                {project.is_archived ? (
                  <ArchiveRestore className="size-4" aria-hidden="true" />
                ) : (
                  <Archive className="size-4" aria-hidden="true" />
                )}
                {project.is_archived ? 'Restore' : 'Archive'}
              </Button>
              <Button
                variant="danger-ghost"
                size="icon"
                onClick={() => setDeleteProjectOpen(true)}
                aria-label="Delete project"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-muted">
                {project.task_count === 0
                  ? 'No tasks yet'
                  : `${project.completed_task_count} of ${project.task_count} tasks complete`}
              </span>
              <span className="text-xs font-bold text-ink">
                {project.completion_percentage}%
              </span>
            </div>
            <ProgressBar
              className="mt-2"
              value={project.completion_percentage}
              color={project.color}
              label={`${project.name} completion`}
              size="sm"
            />
          </div>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-card"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                {stat.label}
              </p>
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-lg ring-1 ${stat.tone}`}
              >
                <stat.icon className="size-3.5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2.5 font-display text-2xl font-extrabold tracking-tight text-ink">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section
        className="mt-5 rounded-[var(--radius-card)] border border-line bg-surface p-3 shadow-card"
        aria-label="Project task filters"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={searchText}
            onChange={setSearchText}
            placeholder="Search tasks in this project…"
            label="Search project tasks"
            className="min-w-0 flex-1"
          />
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="project-task-status" className="sr-only">
              Filter by status
            </label>
            <Select
              id="project-task-status"
              value={status ?? ''}
              onChange={(event) =>
                updateParam('status', event.target.value || undefined)
              }
              className="h-10 w-[145px]"
              aria-label="Filter project tasks by status"
            >
              <option value="">All statuses</option>
              {TASK_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <label htmlFor="project-task-priority" className="sr-only">
              Filter by priority
            </label>
            <Select
              id="project-task-priority"
              value={priority ?? ''}
              onChange={(event) =>
                updateParam('priority', event.target.value || undefined)
              }
              className="h-10 w-[145px]"
              aria-label="Filter project tasks by priority"
            >
              <option value="">All priorities</option>
              {TASK_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <label htmlFor="project-task-sort" className="sr-only">
              Sort project tasks
            </label>
            <Select
              id="project-task-sort"
              value={ordering}
              onChange={(event) => updateParam('ordering', event.target.value)}
              className="h-10 w-[185px]"
              aria-label="Sort project tasks"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted" aria-live="polite">
          {tasksQuery.isPending
            ? 'Loading tasks…'
            : tasksQuery.data
              ? `${pluralize(tasksQuery.data.count, 'task')}${
                  hasFilters ? ' match your filters' : ' in this project'
                }`
              : null}
        </p>
        <Link
          to={`/app/board?project=${project.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-800"
        >
          Open on board
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </Link>
      </div>

      {tasksQuery.isPending ? (
        <div
          className="mt-3 space-y-3 rounded-[var(--radius-card)] border border-line bg-surface p-4"
          aria-label="Loading project tasks"
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-2">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="ml-auto h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : tasksQuery.isError ? (
        <ErrorState
          className="mt-3"
          error={tasksQuery.error}
          title="Project tasks could not be loaded"
          onRetry={() => {
            void tasksQuery.refetch()
          }}
        />
      ) : tasksQuery.data && tasksQuery.data.count === 0 ? (
        <div className="mt-3">
          {hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="No tasks match these filters"
              description="Try a different status, priority or search term to find work in this project."
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ListChecks}
              title="This project has no tasks yet"
              description="Add the next clear action and this project will start to take shape."
              action={
                <Button
                  onClick={() => openCreateTask(project.id)}
                  disabled={project.is_archived}
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add a task
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

      {project.is_archived ? (
        <p className="mt-4 rounded-xl border border-line bg-slate-50 px-4 py-3 text-[11px] leading-5 text-muted">
          This project is archived. Its tasks are preserved and can still be
          viewed or edited. Restore the project to add new tasks from this page.
        </p>
      ) : null}

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={project}
      />

      <ConfirmDialog
        open={archiveConfirmOpen}
        onOpenChange={setArchiveConfirmOpen}
        title={project.is_archived ? 'Restore this project?' : 'Archive this project?'}
        description={
          project.is_archived
            ? `“${project.name}” will return to your active projects.`
            : `“${project.name}” will move to Archived. Its ${pluralize(project.task_count, 'task')} stay intact, and you can restore it at any time.`
        }
        confirmLabel={project.is_archived ? 'Restore project' : 'Archive project'}
        pending={updateProject.isPending}
        destructive={false}
        onConfirm={() => {
          void handleArchive()
        }}
      />

      <ProjectDeleteDialog
        project={deleteProjectOpen ? project : null}
        onClose={() => setDeleteProjectOpen(false)}
        onDeleted={handleProjectDeleted}
      />

      <TaskDeleteDialog
        task={taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onDeleted={handleTaskDeleted}
      />
    </div>
  )
}
