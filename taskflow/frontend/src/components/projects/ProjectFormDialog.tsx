import { useEffect } from 'react'
import { toast } from 'sonner'

import { ProjectForm } from '@/components/projects/ProjectForm'
import { Modal } from '@/components/ui/Modal'
import { useCreateProject, useUpdateProject } from '@/hooks/useMutations'
import type { Project, ProjectPayload } from '@/types/api'

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
}: ProjectFormDialogProps) {
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const pending = createMutation.isPending || updateMutation.isPending
  const error = project ? updateMutation.error : createMutation.error

  useEffect(() => {
    if (open) {
      createMutation.reset()
      updateMutation.reset()
    }
    // Only reset when the dialog is opened for a different action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project?.id])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && pending) return
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (payload: ProjectPayload) => {
    try {
      if (project) {
        const updated = await updateMutation.mutateAsync({
          projectId: project.id,
          payload,
        })
        toast.success('Project updated', { description: updated.name })
      } else {
        const created = await createMutation.mutateAsync(payload)
        toast.success('Project created', { description: created.name })
      }
      onOpenChange(false)
    } catch {
      // Validation and server errors are shown in the form.
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={project ? 'Edit project' : 'Create a project'}
      description={
        project
          ? 'Keep the details and color of this project up to date.'
          : 'Give related work a home and a clear outcome.'
      }
      showClose={!pending}
    >
      <ProjectForm
        key={project?.id ?? 'new-project'}
        project={project}
        onSubmit={handleSubmit}
        onCancel={() => handleOpenChange(false)}
        isSubmitting={pending}
        error={error}
        submitLabel={project ? 'Save changes' : 'Create project'}
      />
    </Modal>
  )
}
