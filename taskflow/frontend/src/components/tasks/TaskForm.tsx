import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { CircleAlert } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { FormField, Input, Select, Textarea } from '@/components/ui/Field'
import {
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from '@/lib/constants'
import { formatDateInput } from '@/lib/dates'
import { getErrorMessage, getFieldError, normalizeApiError } from '@/lib/errors'
import type {
  Project,
  Task,
  TaskPayload,
  TaskPriority,
  TaskStatus,
} from '@/types/api'

const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Enter a task title.')
    .max(200, 'Keep the title under 200 characters.'),
  description: z
    .string()
    .max(5000, 'Keep the description under 5,000 characters.'),
  project: z.string().min(1, 'Choose a project.'),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskFormProps {
  projects: Project[]
  task?: Task
  defaultProjectId?: number
  onSubmit: (payload: TaskPayload) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
  error?: unknown
  submitLabel?: string
}

export function TaskForm({
  projects,
  task,
  defaultProjectId,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
  submitLabel,
}: TaskFormProps) {
  const projectFallback = task?.project ?? defaultProjectId ?? projects[0]?.id

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      project: projectFallback ? String(projectFallback) : '',
      status: task?.status ?? ('todo' as TaskStatus),
      priority: task?.priority ?? ('medium' as TaskPriority),
      due_date: formatDateInput(task?.due_date ?? null),
    },
  })

  useEffect(() => {
    if (!error) return
    const apiError = normalizeApiError(error)
    for (const field of [
      'title',
      'description',
      'project',
      'status',
      'priority',
      'due_date',
    ] as const) {
      if (apiError.fields[field]) {
        setError(field, { type: 'server', message: apiError.fields[field] })
      }
    }
  }, [error, setError])

  const submit = handleSubmit(async (values) => {
    clearErrors()
    const selectedProject = projects.find(
      (project) => String(project.id) === values.project,
    )
    if (!selectedProject) {
      setError('project', {
        type: 'manual',
        message: 'Choose a project for this task.',
      })
      return
    }

    await onSubmit({
      title: values.title,
      description: values.description,
      project: selectedProject.id,
      status: values.status,
      priority: values.priority,
      due_date: values.due_date || null,
    })
  })

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-warning-soft p-4">
        <div className="flex items-start gap-3">
          <CircleAlert
            className="mt-0.5 size-5 shrink-0 text-warning"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-sm font-bold text-ink">
              Create a project first
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Every task lives inside a project, so your work stays organized.
              Creating one only takes a moment.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/app/projects">Go to projects</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const generalError =
    error && !Object.keys(normalizeApiError(error).fields).length
      ? getErrorMessage(error)
      : error && normalizeApiError(error).fields.__all__
        ? getFieldError(error, '__all__')
        : null

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {generalError ? (
        <div
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-danger-soft px-3.5 py-3 text-sm text-danger"
          role="alert"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{generalError}</p>
        </div>
      ) : null}

      <FormField
        label="Task title"
        htmlFor="task-title"
        error={errors.title?.message}
      >
        <Input
          id="task-title"
          autoFocus
          placeholder="e.g. Draft the launch announcement"
          invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'task-title-error' : undefined}
          {...register('title')}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="task-description"
        error={errors.description?.message}
        optional
      >
        <Textarea
          id="task-description"
          rows={4}
          placeholder="Add context, links or a clear definition of done."
          invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? 'task-description-error' : undefined
          }
          {...register('description')}
        />
      </FormField>

      <FormField
        label="Project"
        htmlFor="task-project"
        error={errors.project?.message}
      >
        <Select
          id="task-project"
          invalid={Boolean(errors.project)}
          aria-describedby={errors.project ? 'task-project-error' : undefined}
          {...register('project')}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
              {project.is_archived ? ' (archived)' : ''}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Status"
          htmlFor="task-status"
          error={errors.status?.message}
        >
          <Select id="task-status" {...register('status')}>
            {TASK_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Priority"
          htmlFor="task-priority"
          error={errors.priority?.message}
        >
          <Select id="task-priority" {...register('priority')}>
            {TASK_PRIORITY_OPTIONS.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField
        label="Due date"
        htmlFor="task-due-date"
        error={errors.due_date?.message}
        hint="Leave empty if this task has no deadline."
        optional
      >
        <Input
          id="task-due-date"
          type="date"
          invalid={Boolean(errors.due_date)}
          {...register('due_date')}
        />
      </FormField>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel ?? (task ? 'Save changes' : 'Create task')}
        </Button>
      </div>
    </form>
  )
}
