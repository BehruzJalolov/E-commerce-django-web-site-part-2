import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import type { Project } from '@/types/api'

interface ProjectActionsMenuProps {
  project: Project
  onEdit: (project: Project) => void
  onArchive: (project: Project, archived: boolean) => void
  onDelete: (project: Project) => void
  triggerClassName?: string
}

export function ProjectActionsMenu({
  project,
  onEdit,
  onArchive,
  onDelete,
  triggerClassName,
}: ProjectActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            triggerClassName ??
            'grid size-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-2'
          }
          aria-label={`Actions for ${project.name}`}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem icon={Pencil} onSelect={() => onEdit(project)}>
          Edit project
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={project.is_archived ? ArchiveRestore : Archive}
          onSelect={() => onArchive(project, !project.is_archived)}
        >
          {project.is_archived ? 'Restore project' : 'Archive project'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={Trash2}
          destructive
          onSelect={() => onDelete(project)}
        >
          Delete project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
