import { ArrowUpRight, FolderKanban } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ProjectActionsMenu } from '@/components/projects/ProjectActionsMenu'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatRelativeTime } from '@/lib/dates'
import { pluralize } from '@/lib/utils'
import type { Project } from '@/types/api'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onArchive: (project: Project, archived: boolean) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({
  project,
  onEdit,
  onArchive,
  onDelete,
}: ProjectCardProps) {
  return (
    <article className="group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-float/40">
      <div className="flex items-start justify-between gap-3">
        <span
          className="grid size-10 place-items-center rounded-xl"
          style={{
            color: project.color,
            backgroundColor: `${project.color}14`,
          }}
          aria-hidden="true"
        >
          <FolderKanban className="size-5" />
        </span>
        <div className="flex items-center gap-1">
          {project.is_archived ? (
            <Badge tone="neutral" className="mr-1">
              Archived
            </Badge>
          ) : null}
          <ProjectActionsMenu
            project={project}
            onEdit={onEdit}
            onArchive={onArchive}
            onDelete={onDelete}
            triggerClassName="-mr-1 grid size-8 place-items-center rounded-lg text-subtle opacity-70 transition hover:bg-slate-100 hover:text-ink hover:opacity-100"
          />
        </div>
      </div>

      <h2 className="mt-4 text-base font-bold tracking-tight text-ink">
        <Link
          to={`/app/projects/${project.id}`}
          className="transition-colors hover:text-brand-700 focus-visible:outline-2"
        >
          {project.name || 'Untitled project'}
        </Link>
      </h2>
      <p className="mt-1.5 line-clamp-2 min-h-[40px] text-[13px] leading-5 text-muted">
        {project.description || 'No description added yet.'}
      </p>

      <div className="mt-5 border-t border-line pt-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-muted">
            {project.task_count === 0
              ? 'No tasks yet'
              : `${pluralize(project.completed_task_count, 'task')} complete`}
          </span>
          <span className="font-bold text-ink">
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

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-[11px] text-subtle">
          {project.task_count === 1 ? '1 task total' : `${project.task_count} tasks`}
          {' · '}
          Updated {formatRelativeTime(project.updated_at)}
        </span>
        <Link
          to={`/app/projects/${project.id}`}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-brand-700 hover:text-brand-800"
        >
          Open
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
