import { useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDeleteTask } from '@/hooks/useMutations'
import { getErrorMessage } from '@/lib/errors'
import type { Task } from '@/types/api'

interface TaskDeleteDialogProps {
  task: Task | null
  onClose: () => void
  onDeleted?: () => void
}

export function TaskDeleteDialog({
  task,
  onClose,
  onDeleted,
}: TaskDeleteDialogProps) {
  const deleteMutation = useDeleteTask()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleClose = (open: boolean) => {
    if (!open && !deleteMutation.isPending) {
      setErrorMessage(null)
      onClose()
    }
  }

  const handleConfirm = async () => {
    if (!task) return
    setErrorMessage(null)
    try {
      await deleteMutation.mutateAsync(task.id)
      toast.success('Task deleted', { description: task.title })
      onClose()
      onDeleted?.()
    } catch (error) {
      const message = getErrorMessage(error)
      setErrorMessage(message)
      toast.error('Could not delete task', { description: message })
    }
  }

  return (
    <ConfirmDialog
      open={Boolean(task)}
      onOpenChange={handleClose}
      title="Delete this task?"
      description={
        errorMessage
          ? `${errorMessage} The task has not been deleted.`
          : task
            ? `“${task.title}” will be permanently deleted. This action cannot be undone.`
            : ''
      }
      confirmLabel="Delete task"
      pending={deleteMutation.isPending}
      onConfirm={() => {
        void handleConfirm()
      }}
    />
  )
}
