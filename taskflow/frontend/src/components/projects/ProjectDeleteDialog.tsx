import { useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDeleteProject } from '@/hooks/useMutations'
import { getErrorMessage } from '@/lib/errors'
import type { Project } from '@/types/api'

interface ProjectDeleteDialogProps {
  project: Project | null
  onClose: () => void
  onDeleted?: () => void
}

export function ProjectDeleteDialog({
  project,
  onClose,
  onDeleted,
}: ProjectDeleteDialogProps) {
  const deleteMutation = useDeleteProject()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleClose = (open: boolean) => {
    if (!open && !deleteMutation.isPending) {
      setErrorMessage(null)
      onClose()
    }
  }

  const handleConfirm = async () => {
    if (!project) return
    setErrorMessage(null)
    try {
      await deleteMutation.mutateAsync(project.id)
      toast.success('Project deleted', { description: project.name })
      onClose()
      onDeleted?.()
    } catch (error) {
      const message = getErrorMessage(error)
      setErrorMessage(message)
      toast.error('Could not delete project', { description: message })
    }
  }

  const taskCaveat =
    project && project.task_count > 0
      ? ` Its ${project.task_count === 1 ? 'task' : `${project.task_count} tasks`} will also be deleted.`
      : ''

  return (
    <ConfirmDialog
      open={Boolean(project)}
      onOpenChange={handleClose}
      title="Delete this project?"
      description={
        errorMessage
          ? `${errorMessage} The project has not been deleted.`
          : project
            ? `“${project.name}” will be permanently deleted.${taskCaveat} This action cannot be undone.`
            : ''
      }
      confirmLabel="Delete project"
      pending={deleteMutation.isPending}
      onConfirm={() => {
        void handleConfirm()
      }}
    />
  )
}
