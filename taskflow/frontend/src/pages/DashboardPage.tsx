import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FolderKanban,
  FolderPlus,
  ListChecks,
  ListPlus,
  Plus,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { PriorityBars } from '@/components/dashboard/PriorityBars'
import { StatCard } from '@/components/dashboard/StatCard'
import { StatusDonut } from '@/components/dashboard/StatusDonut'
import { DueDateLabel, TaskStatusBadge } from '@/components/tasks/TaskBadges'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PageHeader } from '@/components/ui/PageHeader'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAuth } from '@/context/AuthContext'
import { useTaskDialog } from '@/context/TaskDialogContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useDashboard } from '@/hooks/useWorkspace'
import { formatDate, formatShortDate, getDueDateMeta, parseDate } from '@/lib/dates'
import { cn, getDisplayName, pluralize } from '@/lib/utils'
import type { DashboardData, Task } from '@/types/api'

function DashboardSkeleton() {
  return (
    <div className="mt-7 space-y-4" aria-label="Loading dashboard">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[132px] rounded-[18px]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-[270px] rounded-[18px] xl:col-span-4" />
        <Skeleton className="h-[270px] rounded-[18px] xl:col-span-5" />
        <Skeleton className="h-[270px] rounded-[18px] xl:col-span-3" />
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Skeleton className="h-[340px] rounded-[18px] xl:col-span-7" />
        <Skeleton className="h-[340px] rounded-[18px] xl:col-span-5" />
      </div>
    </div>
  )
}

function CardHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: { label: string; to: string }
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-bold tracking-tight text-ink">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-[11px] text-muted">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          to={action.to}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-700 transition-colors hover:text-brand-800"
        >
          {action.label}
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  )
}

function OnboardingPanel({
  data,
  onCreateTask,
}: {
  data: DashboardData
  onCreateTask: () => void
}) {
  const hasProjects = data.stats.total_projects > 0

  const steps = [
    {
      icon: FolderPlus,
      title: 'Create a project',
      description: 'Give a goal a name and a home.',
    },
    {
      icon: ListPlus,
      title: 'Add clear tasks',
      description: 'Capture the next actionable step.',
    },
    {
      icon: CheckCircle2,
      title: 'Build momentum',
      description: 'Move work forward, one completion at a time.',
    },
  ]

  return (
    <section className="relative mt-4 overflow-hidden rounded-[var(--radius-card)] border border-brand-100 bg-white p-6 shadow-card sm:p-8">
      <div
        className="absolute -right-16 -top-24 size-64 rounded-full bg-brand-50"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-700">
              <Sparkles className="size-3" aria-hidden="true" />
              Your workspace is ready
            </div>
            <h2 className="mt-4 text-balance font-display text-[24px] font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-[28px]">
              Start with one project. Then one clear next step.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {hasProjects
                ? `You have ${pluralize(data.stats.total_projects, 'project')} ready. Add the first task to turn intent into progress.`
                : 'Every task belongs to a project, so begin by creating a place for the work you want to move forward.'}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {hasProjects ? (
              <Button onClick={onCreateTask}>
                <Plus className="size-4" aria-hidden="true" />
                Add your first task
              </Button>
            ) : (
              <Button asChild>
                <Link to="/app/projects">
                  <FolderPlus className="size-4" aria-hidden="true" />
                  Create a project
                </Link>
              </Button>
            )}
            {hasProjects ? (
              <Button variant="secondary" asChild>
                <Link to="/app/projects">View projects</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-line bg-canvas/80 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-8 place-items-center rounded-lg bg-white text-brand-600 shadow-sm ring-1 ring-line">
                  <step.icon className="size-4" aria-hidden="true" />
                </span>
                <span className="font-display text-[10px] font-extrabold tracking-wide text-subtle">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-3 text-xs font-bold text-ink">{step.title}</h3>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RecentTaskRow({ task }: { task: Task }) {
  return (
    <Link
      to={`/app/tasks/${task.id}`}
      className="group flex items-center gap-3 border-b border-line/80 py-3 last:border-0 last:pb-0 first:pt-0"
    >
      <span
        className={cn(
          'size-2 shrink-0 rounded-full',
          task.status === 'done'
            ? 'bg-emerald-500'
            : task.status === 'in_progress'
              ? 'bg-sky-500'
              : 'bg-slate-300',
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-[13px] font-semibold transition-colors group-hover:text-brand-700',
            task.is_completed
              ? 'text-muted line-through decoration-slate-300'
              : 'text-ink',
          )}
        >
          {task.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[10px] text-muted">
          <span
            className="size-1 rounded-full"
            style={{ backgroundColor: task.project_detail.color }}
          />
          {task.project_detail.name}
        </p>
      </div>
      <TaskStatusBadge status={task.status} />
      <span className="hidden w-[96px] justify-end sm:flex">
        <DueDateLabel task={task} />
      </span>
    </Link>
  )
}

function UpcomingTaskRow({ task }: { task: Task }) {
  const date = parseDate(task.due_date)
  const due = getDueDateMeta(task.due_date, {
    completed: task.is_completed,
    isOverdue: task.is_overdue,
  })

  return (
    <Link
      to={`/app/tasks/${task.id}`}
      className="group flex gap-3 border-b border-line/80 py-3 last:border-0 last:pb-0 first:pt-0"
    >
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border',
          due.tone === 'today'
            ? 'border-amber-200 bg-warning-soft text-warning'
            : due.tone === 'overdue'
              ? 'border-red-200 bg-danger-soft text-danger'
              : 'border-line bg-slate-50 text-muted',
        )}
      >
        <span className="text-[8px] font-bold uppercase tracking-wide">
          {date ? format(date, 'MMM') : '—'}
        </span>
        <span className="text-sm font-extrabold leading-none">
          {date ? format(date, 'd') : '—'}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink transition-colors group-hover:text-brand-700">
          {task.title}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-muted">
          {task.project_detail.name}
        </p>
        <p
          className={cn(
            'mt-0.5 text-[10px] font-medium',
            due.tone === 'today'
              ? 'text-warning'
              : due.tone === 'overdue'
                ? 'text-danger'
                : 'text-subtle',
          )}
        >
          {due.label} · {formatShortDate(task.due_date)}
        </p>
      </div>
    </Link>
  )
}

export function DashboardPage() {
  useDocumentTitle('Dashboard')
  const { user } = useAuth()
  const { openCreateTask } = useTaskDialog()
  const dashboardQuery = useDashboard()

  if (dashboardQuery.isPending) {
    return (
      <div className="page-shell">
        <PageHeader title="Dashboard" description="Loading your workspace…" />
        <DashboardSkeleton />
      </div>
    )
  }

  if (dashboardQuery.isError) {
    return (
      <div className="page-shell">
        <PageHeader title="Dashboard" />
        <ErrorState
          className="mt-6"
          error={dashboardQuery.error}
          title="Your dashboard could not be loaded"
          onRetry={() => {
            void dashboardQuery.refetch()
          }}
        />
      </div>
    )
  }

  const data = dashboardQuery.data
  if (!data) return null

  const stats = data.stats
  const dateLabel = format(new Date(), 'EEEE, MMMM d')
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName =
    user?.first_name?.trim() ||
    getDisplayName(user).split(/\s+/)[0] ||
    'there'
  const isEmpty = stats.total_tasks === 0
  const nextUp = data.upcoming_tasks[0]

  return (
    <div className="page-shell">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{dateLabel}</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-ink sm:text-[30px]">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted">
            {isEmpty
              ? 'A clear workspace, ready when you are.'
              : nextUp
                ? `You have ${pluralize(stats.todo_tasks + stats.in_progress_tasks, 'open task')}. Next deadline: ${formatDate(nextUp.due_date)}.`
                : `${pluralize(stats.in_progress_tasks, 'task')} in progress and ${pluralize(stats.todo_tasks, 'task')} waiting in To Do.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link to="/app/board">View board</Link>
          </Button>
          <Button onClick={() => openCreateTask()}>
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={stats.total_tasks}
          detail={`${stats.todo_tasks} to do · ${stats.in_progress_tasks} in progress`}
          icon={ListChecks}
          tone="brand"
          to="/app/tasks"
        />
        <StatCard
          label="Completed"
          value={stats.completed_tasks}
          detail={`${stats.completion_percentage}% of all tasks complete`}
          icon={CheckCircle2}
          tone="emerald"
          to="/app/tasks?status=done"
        />
        <StatCard
          label="In progress"
          value={stats.in_progress_tasks}
          detail={`${stats.todo_tasks} pending in To Do`}
          icon={Clock3}
          tone="sky"
          to="/app/tasks?status=in_progress"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue_tasks}
          detail={
            stats.overdue_tasks > 0
              ? 'Needs your attention'
              : 'Nothing overdue right now'
          }
          icon={AlertCircle}
          tone={stats.overdue_tasks > 0 ? 'rose' : 'slate'}
          to="/app/tasks?due=overdue"
        />
      </div>

      {isEmpty ? (
        <OnboardingPanel
          data={data}
          onCreateTask={() => openCreateTask()}
        />
      ) : (
        <>
          <div className="mt-4 grid gap-4 lg:grid-cols-12">
            <section className="card p-5 lg:col-span-5 xl:col-span-4">
              <CardHeader
                title="Completion"
                description="The shape of your workspace"
              />
              <div className="mt-5">
                <StatusDonut
                  items={data.status_breakdown}
                  total={stats.total_tasks}
                  completion={stats.completion_percentage}
                />
              </div>
            </section>

            <section className="card p-5 lg:col-span-7 xl:col-span-5">
              <CardHeader
                title="Last 7 days"
                description="Tasks created and completed"
              />
              <div className="mt-5">
                <ActivityChart items={data.weekly_activity} />
              </div>
            </section>

            <section className="card p-5 lg:col-span-12 xl:col-span-3">
              <CardHeader
                title="Priority mix"
                description="Where your attention is needed"
              />
              <PriorityBars items={data.priority_breakdown} />
            </section>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-12">
            <section className="card flex h-full flex-col p-5 xl:col-span-7">
              <CardHeader
                title="Recently updated"
                description="The tasks closest to your attention"
                action={{ label: 'All tasks', to: '/app/tasks' }}
              />
              <div className="mt-4 flex-1">
                {data.recent_tasks.length > 0 ? (
                  data.recent_tasks.map((task) => (
                    <RecentTaskRow key={task.id} task={task} />
                  ))
                ) : (
                  <EmptyState
                    icon={CircleDashed}
                    title="No recent tasks"
                    description="Create a task and it will appear here as you work."
                    compact
                    className="h-full"
                    action={
                      <Button size="sm" onClick={() => openCreateTask()}>
                        <Plus className="size-3.5" aria-hidden="true" />
                        New task
                      </Button>
                    }
                  />
                )}
              </div>
            </section>

            <section className="card flex h-full flex-col p-5 xl:col-span-5">
              <CardHeader
                title="Upcoming deadlines"
                description="Open tasks due in the next 7 days"
                action={{ label: 'View', to: '/app/tasks?due=upcoming' }}
              />
              <div className="mt-4 flex-1">
                {data.upcoming_tasks.length > 0 ? (
                  data.upcoming_tasks.map((task) => (
                    <UpcomingTaskRow key={task.id} task={task} />
                  ))
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-slate-50/50 px-4 py-8 text-center">
                    <span className="grid size-9 place-items-center rounded-full bg-positive-soft text-positive">
                      <CalendarDays className="size-4" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-xs font-bold text-ink">
                      No deadlines in the next 7 days
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      Your upcoming week has some breathing room.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="card mt-4 p-5">
            <CardHeader
              title="Project overview"
              description="Active projects and their real completion"
              action={{ label: 'All projects', to: '/app/projects' }}
            />
            {data.projects.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/app/projects/${project.id}`}
                    className="group rounded-xl border border-line bg-canvas/60 p-4 transition-colors hover:border-line-strong hover:bg-canvas"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: project.color }}
                          aria-hidden="true"
                        />
                        <span className="truncate text-xs font-bold text-ink group-hover:text-brand-700">
                          {project.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] font-bold text-ink">
                        {project.completion_percentage}%
                      </span>
                    </div>
                    <ProgressBar
                      value={project.completion_percentage}
                      color={project.color}
                      label={`${project.name} completion`}
                      size="sm"
                      className="mt-3"
                    />
                    <p className="mt-2 text-[10px] text-muted">
                      {project.completed_task_count} of {project.task_count}{' '}
                      tasks complete
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon={FolderKanban}
                  title="No active projects"
                  description="Create a project to group tasks and track progress."
                  compact
                  action={
                    <Button size="sm" asChild>
                      <Link to="/app/projects">Create a project</Link>
                    </Button>
                  }
                />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
