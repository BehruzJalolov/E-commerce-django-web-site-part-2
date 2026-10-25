import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { TaskForm } from '@/components/tasks/TaskForm'
import { ErrorState } from '@/components/ui/ErrorState'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAllProjects } from '@/hooks/useWorkspace'
import { useCreateTask, useUpdateTask } from '@/hooks/useMutations'
import type { Task, TaskPayload } from '@/types/api'

interface TaskDialogState {
  open: boolean
  task?: Task
  defaultProjectId?: number
}

interface TaskDialogContextValue {
  openCreateTask: (defaultProjectId?: number) => void
  openEditTask: (task: Task) => void
}

const TaskDialogContext = createContext<TaskDialogContextValue | null>(null)

export function TaskDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TaskDialogState>({ open: false })
  const projectsQuery = useAllProjects()
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()

  const pending = createMutation.isPending || updateMutation.isPending
  const error = state.task ? updateMutation.error : createMutation.error

  const openCreateTask = (defaultProjectId?: number) => {
    createMutation.reset()
    updateMutation.reset()
    setState({ open: true, defaultProjectId })
  }

  const openEditTask = (task: Task) => {
    createMutation.reset()
    updateMutation.reset()
    setState({ open: true, task })
  }

  const close = () => {
    if (pending) return
    setState({ open: false })
  }

  const handleSubmit = async (payload: TaskPayload) => {
    try {
      if (state.task) {
        const updated = await updateMutation.mutateAsync({
          taskId: state.task.id,
          payload,
        })
        toast.success('Task updated', {
          description: updated.title,
        })
      } else {
        const created = await createMutation.mutateAsync(payload)
        toast.success('Task created', {
          description: created.title,
        })
      }
      setState({ open: false })
    } catch {
      // The form renders the server response inline.
    }
  }

  const value = useMemo<TaskDialogContextValue>(
    () => ({ openCreateTask, openEditTask }),
    [],
  )

  return (
    <TaskDialogContext.Provider value={value}>
      {children}
      <Modal
        open={state.open}
        onOpenChange={(open) => {
          if (!open) close()
        }}
        title={state.task ? 'Edit task' : 'Create a task'}
        description={
          state.task
            ? 'Update the details, timing or status of this task.'
            : 'Add a clear next action to one of your projects.'
        }
        size="lg"
        showClose={!pending}
      >
        {projectsQuery.isPending ? (
          <div className="space-y-4" aria-label="Loading projects">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : projectsQuery.isError ? (
          <ErrorState
            error={projectsQuery.error}
            title="Projects could not be loaded"
            onRetry={() => {
              void projectsQuery.refetch()
            }}
            compact
          />
        ) : (
          <TaskForm
            key={state.task?.id ?? `new-${state.defaultProjectId ?? ''}`}
            projects={projectsQuery.data ?? []}
            task={state.task}
            defaultProjectId={state.defaultProjectId}
            onSubmit={handleSubmit}
            onCancel={close}
            isSubmitting={pending}
            error={error}
            submitLabel={state.task ? 'Save changes' : 'Create task'}
          />
        )}
      </Modal>
    </TaskDialogContext.Provider>
  )
}

export function useTaskDialog() {
  const context = useContext(TaskDialogContext)
  if (!context) {
    throw new Error('useTaskDialog must be used inside a TaskDialogProvider.')
  }
  return context
}
