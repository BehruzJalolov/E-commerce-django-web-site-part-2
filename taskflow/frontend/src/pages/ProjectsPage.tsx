import { Archive, FolderKanban, LoaderCircle, Plus, SearchX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectDeleteDialog } from '@/components/projects/ProjectDeleteDialog'
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/ui/PageHeader'
import { Pagination } from '@/components/ui/Pagination'
import { SearchInput } from '@/components/ui/SearchInput'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Skeleton } from '@/components/ui/Skeleton'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useUpdateProject } from '@/hooks/useMutations'
import { useProjects } from '@/hooks/useWorkspace'
import {
  PROJECT_PAGE_SIZE,
  PROJECT_SORT_OPTIONS,
} from '@/lib/constants'
import { getErrorMessage } from '@/lib/errors'
import { getPageParam, pluralize } from '@/lib/utils'
import type { Project, ProjectQuery } from '@/types/api'

type ArchiveFilter = 'active' | 'archived'

function ProjectsSkeleton() {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading projects">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-[266px] rounded-[18px]" />
      ))}
    </div>
  )
}

export function ProjectsPage() {
  useDocumentTitle('Projects')
  const [searchParams, setSearchParams] = useSearchParams()
  const archived: ArchiveFilter =
    searchParams.get('archived') === 'archived' ? 'archived' : 'active'
  const rawOrdering = searchParams.get('ordering')
  const ordering = PROJECT_SORT_OPTIONS.some(
    (option) => option.value === rawOrdering,
  )
    ? (rawOrdering as string)
    : '-updated_at'
  const urlSearch = searchParams.get('search') ?? ''
  const page = getPageParam(searchParams)

  const [searchText, setSearchText] = useState(urlSearch)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [archiveTarget, setArchiveTarget] = useState<{
    project: Project
    archived: boolean
  } | null>(null)

  const queryParams: ProjectQuery = {
    archived,
    search: urlSearch,
    ordering,
    page,
    page_size: PROJECT_PAGE_SIZE,
  }
  const projectsQuery = useProjects(queryParams)
  const updateProject = useUpdateProject()

  useEffect(() => {
    setSearchText(urlSearch)
  }, [urlSearch])

  useEffect(() => {
    if (searchText === urlSearch) return
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      if (searchText.trim()) {
        next.set('search', searchText.trim())
      } else {
        next.delete('search')
      }
      next.delete('page')
      setSearchParams(next, { replace: true })
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [searchParams, searchText, setSearchParams, urlSearch])

  const setArchiveFilter = (nextFilter: ArchiveFilter) => {
    const next = new URLSearchParams(searchParams)
    if (nextFilter === 'active') {
      next.delete('archived')
    } else {
      next.set('archived', nextFilter)
    }
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const setOrdering = (nextOrdering: string) => {
    const next = new URLSearchParams(searchParams)
    if (nextOrdering === '-updated_at') {
      next.delete('ordering')
    } else {
      next.set('ordering', nextOrdering)
    }
    next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams()
    if (archived === 'archived') next.set('archived', 'archived')
    setSearchParams(next, { replace: true })
  }, [archived, setSearchParams])

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(searchParams)
    if (nextPage <= 1) {
      next.delete('page')
    } else {
      next.set('page', String(nextPage))
    }
    setSearchParams(next, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openCreate = () => {
    setEditingProject(undefined)
    setFormOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditingProject(project)
    setFormOpen(true)
  }

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return
    try {
      await updateProject.mutateAsync({
        projectId: archiveTarget.project.id,
        payload: { is_archived: archiveTarget.archived },
      })
      toast.success(
        archiveTarget.archived ? 'Project archived' : 'Project restored',
        { description: archiveTarget.project.name },
      )
      setArchiveTarget(null)
    } catch (error) {
      toast.error('Could not update project', {
        description: getErrorMessage(error),
      })
    }
  }

  const handleDeleted = () => {
    if (page > 1 && projectsQuery.data?.results.length === 1) {
      setPage(page - 1)
    }
  }

  const hasFilters = Boolean(urlSearch || ordering !== '-updated_at')
  const activeFiltersLabel =
    "Don't see it here? Check the Archived tab or clear your search."

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Structure"
        title="Projects"
        description="Give related work a home, then track each project’s real progress."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" aria-hidden="true" />
            New project
          </Button>
        }
      />

      <section className="mt-6 rounded-[var(--radius-card)] border border-line bg-surface p-3 shadow-card">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedControl<ArchiveFilter>
            ariaLabel="Project status"
            value={archived}
            onChange={setArchiveFilter}
            options={[
              {
                value: 'active',
                label: 'Active',
              },
              {
                value: 'archived',
                label: 'Archived',
              },
            ]}
            className="lg:w-auto"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchInput
              value={searchText}
              onChange={setSearchText}
              placeholder="Search projects…"
              label="Search projects"
              className="min-w-0 sm:w-[250px]"
            />
            <Select
              value={ordering}
              onChange={(event) => setOrdering(event.target.value)}
              aria-label="Sort projects"
              className="h-10 sm:w-[175px]"
            >
              {PROJECT_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="shrink-0"
              >
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs font-medium text-muted" aria-live="polite">
          {projectsQuery.isPending
            ? 'Loading projects…'
            : projectsQuery.data
              ? `${pluralize(projectsQuery.data.count, 'project')} ${
                  archived === 'archived'
                    ? 'archived'
                    : urlSearch
                      ? 'match your search'
                      : 'active'
                }`
              : null}
        </p>
        {projectsQuery.isFetching && !projectsQuery.isPending ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-subtle">
            <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
            Updating
          </span>
        ) : null}
      </div>

      {projectsQuery.isPending ? (
        <ProjectsSkeleton />
      ) : projectsQuery.isError ? (
        <ErrorState
          className="mt-3"
          error={projectsQuery.error}
          title="Projects could not be loaded"
          onRetry={() => {
            void projectsQuery.refetch()
          }}
        />
      ) : projectsQuery.data && projectsQuery.data.count === 0 ? (
        <div className="mt-3">
          {hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="No projects match"
              description={activeFiltersLabel}
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  Clear search and sorting
                </Button>
              }
            />
          ) : archived === 'archived' ? (
            <EmptyState
              icon={Archive}
              title="No archived projects"
              description="When a project is finished or paused, archive it to keep your active workspace focused."
              action={
                <Button
                  variant="secondary"
                  onClick={() => setArchiveFilter('active')}
                >
                  View active projects
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="Start with a project"
              description="Projects group related tasks and show progress toward an outcome. Create your first one in a few seconds."
              action={
                <Button onClick={openCreate}>
                  <Plus className="size-4" aria-hidden="true" />
                  Create your first project
                </Button>
              }
            />
          )}
        </div>
      ) : projectsQuery.data ? (
        <>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projectsQuery.data.results.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={openEdit}
                onArchive={(item, nextArchived) =>
                  setArchiveTarget({ project: item, archived: nextArchived })
                }
                onDelete={setProjectToDelete}
              />
            ))}
          </div>
          <Pagination
            className="mt-5"
            count={projectsQuery.data.count}
            page={page}
            pageSize={PROJECT_PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="projects"
          />
        </>
      ) : null}

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingProject(undefined)
        }}
        project={editingProject}
      />

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null)
        }}
        title={
          archiveTarget?.archived ? 'Archive this project?' : 'Restore project?'
        }
        description={
          archiveTarget
            ? archiveTarget.archived
              ? `“${archiveTarget.project.name}” will move to Archived. Its tasks stay intact, and you can restore it at any time.`
              : `“${archiveTarget.project.name}” will return to your active projects.`
            : ''
        }
        confirmLabel={
          archiveTarget?.archived ? 'Archive project' : 'Restore project'
        }
        pending={updateProject.isPending}
        destructive={false}
        onConfirm={() => {
          void handleArchiveConfirm()
        }}
      />

      <ProjectDeleteDialog
        project={projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
