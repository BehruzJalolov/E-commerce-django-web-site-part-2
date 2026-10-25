import { useEffect, useState } from 'react'
import {
  SlidersHorizontal,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Field'
import {
  DUE_FILTER_OPTIONS,
  PRIORITY_META,
  SORT_OPTIONS,
  STATUS_META,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Project, SortOrder, TaskPriority, TaskStatus } from '@/types/api'

export interface TaskFilterValues {
  search: string
  status?: TaskStatus
  priority?: TaskPriority
  project?: number
  due?: 'overdue' | 'today' | 'upcoming' | 'none'
  ordering: SortOrder
}

interface TaskFiltersProps {
  value: TaskFilterValues
  onChange: (patch: Partial<TaskFilterValues>) => void
  onClear: () => void
  projects: Project[]
  projectsLoading?: boolean
}

export function TaskFilters({
  value,
  onChange,
  onClear,
  projects,
  projectsLoading = false,
}: TaskFiltersProps) {
  const [searchText, setSearchText] = useState(value.search)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setSearchText(value.search)
  }, [value.search])

  useEffect(() => {
    if (searchText === value.search) return
    const timeout = window.setTimeout(() => {
      onChange({ search: searchText })
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [onChange, searchText, value.search])

  const activeFilterCount = [
    value.status,
    value.priority,
    value.project,
    value.due,
  ].filter((item) => item !== undefined).length

  const hasAnyFilter = Boolean(
    value.search || activeFilterCount || value.ordering !== '-updated_at',
  )

  return (
    <section
      className="rounded-[var(--radius-card)] border border-line bg-surface p-3 shadow-card sm:p-3.5"
      aria-label="Task filters"
    >
      <div className="flex items-center gap-2">
        <SearchInput
          value={searchText}
          onChange={setSearchText}
          placeholder="Search tasks, descriptions or projects…"
          label="Search tasks"
          className="min-w-0 flex-1"
        />

        <div className="hidden w-[190px] shrink-0 lg:block">
          <label htmlFor="task-sort" className="sr-only">
            Sort tasks
          </label>
          <Select
            id="task-sort"
            value={value.ordering}
            onChange={(event) =>
              onChange({ ordering: event.target.value as SortOrder })
            }
            className="h-10"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <Button
          variant="secondary"
          className="shrink-0 sm:hidden"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls="task-filter-panel"
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="grid size-4 place-items-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>

        {hasAnyFilter ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="hidden shrink-0 sm:inline-flex"
          >
            <X className="size-3.5" aria-hidden="true" />
            Reset
          </Button>
        ) : null}
      </div>

      <div
        id="task-filter-panel"
        className={cn(
          'mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4',
          expanded ? 'grid' : 'hidden sm:grid',
        )}
      >
        <div>
          <label htmlFor="filter-status" className="sr-only">
            Filter by status
          </label>
          <Select
            id="filter-status"
            value={value.status ?? ''}
            onChange={(event) =>
              onChange({
                status: (event.target.value || undefined) as
                  | TaskStatus
                  | undefined,
              })
            }
            aria-label="Filter by status"
            className={cn(
              value.status && 'border-brand-200 bg-brand-50/40 text-brand-800',
            )}
          >
            <option value="">All statuses</option>
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="filter-priority" className="sr-only">
            Filter by priority
          </label>
          <Select
            id="filter-priority"
            value={value.priority ?? ''}
            onChange={(event) =>
              onChange({
                priority: (event.target.value || undefined) as
                  | TaskPriority
                  | undefined,
              })
            }
            aria-label="Filter by priority"
            className={cn(
              value.priority &&
                'border-brand-200 bg-brand-50/40 text-brand-800',
            )}
          >
            <option value="">All priorities</option>
            {TASK_PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {PRIORITY_META[option.value].label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="filter-project" className="sr-only">
            Filter by project
          </label>
          <Select
            id="filter-project"
            value={value.project ?? ''}
            onChange={(event) =>
              onChange({
                project: event.target.value
                  ? Number(event.target.value)
                  : undefined,
              })
            }
            aria-label="Filter by project"
            disabled={projectsLoading}
            className={cn(
              value.project && 'border-brand-200 bg-brand-50/40 text-brand-800',
            )}
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
                {project.is_archived ? ' (archived)' : ''}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="filter-due" className="sr-only">
            Filter by due date
          </label>
          <Select
            id="filter-due"
            value={value.due ?? ''}
            onChange={(event) =>
              onChange({
                due: (event.target.value || undefined) as
                  | 'overdue'
                  | 'today'
                  | 'upcoming'
                  | 'none'
                  | undefined,
              })
            }
            aria-label="Filter by due date"
            className={cn(
              value.due && 'border-brand-200 bg-brand-50/40 text-brand-800',
            )}
          >
            <option value="">Any due date</option>
            {DUE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="sm:hidden">
          <label htmlFor="task-sort-mobile" className="sr-only">
            Sort tasks
          </label>
          <Select
            id="task-sort-mobile"
            value={value.ordering}
            onChange={(event) =>
              onChange({ ordering: event.target.value as SortOrder })
            }
            aria-label="Sort tasks"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {hasAnyFilter ? (
          <div className="sm:hidden">
            <Button variant="ghost" size="sm" onClick={onClear} className="w-full">
              <X className="size-3.5" aria-hidden="true" />
              Reset all filters
            </Button>
          </div>
        ) : null}
      </div>

      {activeFilterCount > 0 ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {value.status ? (
            <FilterChip
              label={STATUS_META[value.status].label}
              onRemove={() => onChange({ status: undefined })}
            />
          ) : null}
          {value.priority ? (
            <FilterChip
              label={PRIORITY_META[value.priority].label}
              onRemove={() => onChange({ priority: undefined })}
            />
          ) : null}
          {value.project ? (
            <FilterChip
              label={
                projects.find((project) => project.id === value.project)?.name ??
                'Project'
              }
              onRemove={() => onChange({ project: undefined })}
            />
          ) : null}
          {value.due ? (
            <FilterChip
              label={
                DUE_FILTER_OPTIONS.find((option) => option.value === value.due)
                  ?.label ?? 'Due date'
              }
              onRemove={() => onChange({ due: undefined })}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 py-1 pl-2.5 pr-1 text-[11px] font-semibold text-brand-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="grid size-4 place-items-center rounded-full hover:bg-brand-100"
        aria-label={`Remove ${label} filter`}
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </span>
  )
}
