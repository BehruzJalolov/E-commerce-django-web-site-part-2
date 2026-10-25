import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { FormField, Input, Textarea } from '@/components/ui/Field'
import { PROJECT_COLORS } from '@/lib/constants'
import { getErrorMessage, getFieldError, normalizeApiError } from '@/lib/errors'
import { cn } from '@/lib/utils'
import type { Project, ProjectPayload } from '@/types/api'

const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter a project name.')
    .max(120, 'Keep the name under 120 characters.'),
  description: z
    .string()
    .max(2000, 'Keep the description under 2,000 characters.'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Choose a valid project color.'),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  project?: Project
  onSubmit: (payload: ProjectPayload) => Promise<void> | void
  onCancel: () => void
  isSubmitting?: boolean
  error?: unknown
  submitLabel?: string
}

export function ProjectForm({
  project,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error,
  submitLabel,
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
      color: project?.color ?? PROJECT_COLORS[0],
    },
  })

  const selectedColor = watch('color')

  useEffect(() => {
    if (!error) return
    const apiError = normalizeApiError(error)
    for (const field of ['name', 'description', 'color'] as const) {
      if (apiError.fields[field]) {
        setError(field, { type: 'server', message: apiError.fields[field] })
      }
    }
  }, [error, setError])

  const generalError =
    error && normalizeApiError(error).fields.__all__
      ? getFieldError(error, '__all__')
      : error && !Object.keys(normalizeApiError(error).fields).length
        ? getErrorMessage(error)
        : null

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name,
      description: values.description,
      color: values.color,
    })
  })

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
        label="Project name"
        htmlFor="project-name"
        error={errors.name?.message}
      >
        <Input
          id="project-name"
          autoFocus
          placeholder="e.g. Website refresh"
          invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'project-name-error' : undefined}
          {...register('name')}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="project-description"
        error={errors.description?.message}
        hint="A short sentence about the outcome this project should create."
        optional
      >
        <Textarea
          id="project-description"
          rows={3}
          placeholder="What is this project moving toward?"
          invalid={Boolean(errors.description)}
          {...register('description')}
        />
      </FormField>

      <fieldset>
        <legend className="mb-2 text-[13px] font-semibold text-ink">
          Project color
        </legend>
        <input type="hidden" {...register('color')} />
        <div className="flex flex-wrap items-center gap-2.5">
          {PROJECT_COLORS.map((color) => {
            const active = selectedColor.toLowerCase() === color.toLowerCase()
            return (
              <button
                key={color}
                type="button"
                className={cn(
                  'grid size-8 place-items-center rounded-full transition-transform focus-visible:outline-2 focus-visible:outline-offset-2',
                  active
                    ? 'scale-110 ring-2 ring-ink ring-offset-2'
                    : 'hover:scale-105',
                )}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setValue('color', color, { shouldValidate: true })
                }}
                aria-label={`Use project color ${color}`}
                aria-pressed={active}
              >
                {active ? (
                  <span className="size-2 rounded-full bg-white" />
                ) : null}
              </button>
            )
          })}
          <label
            className="relative grid size-8 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-line-strong bg-slate-50 text-[9px] font-bold text-muted hover:bg-slate-100"
            title="Choose a custom color"
          >
            +
            <input
              type="color"
              value={selectedColor}
              onChange={(event) => {
                setValue('color', event.target.value, { shouldValidate: true })
              }}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Choose a custom project color"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">
          Color is used to identify this project across your workspace.
        </p>
        {errors.color?.message ? (
          <p className="field-error" role="alert">
            {errors.color.message}
          </p>
        ) : null}
      </fieldset>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel ?? (project ? 'Save changes' : 'Create project')}
        </Button>
      </div>
    </form>
  )
}
