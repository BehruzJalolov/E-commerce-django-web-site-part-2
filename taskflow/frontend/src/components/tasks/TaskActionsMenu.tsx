import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import type { Task } from '@/types/api'

interface TaskActionsMenuProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  triggerClassName?: string
}

export function TaskActionsMenu({
  task,
  onEdit,
  onDelete,
  triggerClassName,
}: TaskActionsMenuProps) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={
            triggerClassName ??
            'grid size-8 place-items-center rounded-lg text-subtle transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-2'
          }
          aria-label={`Actions for ${task.title}`}
        >
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          icon={Eye}
          onSelect={() => navigate(`/app/tasks/${task.id}`)}
        >
          View details
        </DropdownMenuItem>
        <DropdownMenuItem icon={Pencil} onSelect={() => onEdit(task)}>
          Edit task
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={Trash2}
          destructive
          onSelect={() => onDelete(task)}
        >
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
